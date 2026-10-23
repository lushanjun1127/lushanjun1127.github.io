import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import dns from "node:dns/promises";
import net from "node:net";
import pLimit from "p-limit";

const MAX_REDIRECTS = 3;
const MAX_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const ICON_TIMEOUT_MS = 3_000;
const ICON_CONCURRENCY = 3;
const MAX_ICON_CANDIDATES = 6;
const ICON_TOTAL_TIMEOUT_MS = 8_000;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

const PRIVATE_V4: Array<[string, number]> = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
];

const BLOCKED = new net.BlockList();
for (const [base, bits] of PRIVATE_V4) BLOCKED.addSubnet(base, bits, "ipv4");
BLOCKED.addSubnet("fc00::", 7, "ipv6");
BLOCKED.addSubnet("fe80::", 10, "ipv6");
BLOCKED.addAddress("::1", "ipv6");
BLOCKED.addAddress("::", "ipv6");
// 注意：不要添加 ::ffff:0:0/96。Node 会把 IPv4 视为 IPv4-mapped IPv6 参与匹配，
// 加上该段会导致所有 IPv4 公网地址被判为私有。映射写法在 isPrivateIp 中手动归一化。

class BlockedError extends Error {}

function isPrivateIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return BLOCKED.check(ip, "ipv4");
  if (family === 6) {
    if (BLOCKED.check(ip, "ipv6")) return true;
    // 显式处理 ::ffff:x.x.x.x 与 ::ffff:hi:lo 两种映射写法
    const dotted = ip.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (dotted) return BLOCKED.check(dotted[1], "ipv4");
    const hex = ip.toLowerCase().match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hex) {
      const hi = parseInt(hex[1], 16), lo = parseInt(hex[2], 16);
      return BLOCKED.check([hi >> 8, hi & 255, lo >> 8, lo & 255].join("."), "ipv4");
    }
    return false;
  }
  return true; // 非 IP 一律拒绝
}

async function assertPublicHost(hostname: string): Promise<void> {
  // WHATWG URL 的 IPv6 字面量带方括号，需先剥离
  const host = hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new BlockedError("blocked: private ip");
    return;
  }
  const addrs = await dns.lookup(host, { all: true });
  if (addrs.length === 0) throw new BlockedError("blocked: no dns");
  for (const a of addrs) {
    if (isPrivateIp(a.address)) throw new BlockedError("blocked: private ip (dns)");
  }
}

async function readCapped(res: Response, limit: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > limit) {
        try { await reader.cancel(); } catch {}
        throw new Error("response too large");
      }
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function safeFetch(
  input: string,
  init: RequestInit = {},
  opts: { timeoutMs?: number; maxBytes?: number; requireHtml?: boolean } = {}
): Promise<{ res: Response; html?: string }> {
  const timeoutMs = opts.timeoutMs ?? FETCH_TIMEOUT_MS;
  const maxBytes = opts.maxBytes ?? MAX_BYTES;

  let current = input;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const u = new URL(current);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new BlockedError("blocked: protocol");
    }
    await assertPublicHost(u.hostname);

    const res = await fetch(current, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("redirect without location");
      try { await res.body?.cancel(); } catch {}
      current = new URL(loc, current).href;
      continue;
    }

    if (opts.requireHtml) {
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("text/html")) {
        try { await res.body?.cancel(); } catch {}
        return { res };
      }
      const html = await readCapped(res, maxBytes);
      return { res, html };
    }

    try { await res.body?.cancel(); } catch {}
    return { res };
  }
  throw new Error("too many redirects");
}

const iconLimit = pLimit(ICON_CONCURRENCY);

async function checkUrl(url: string): Promise<boolean> {
  try {
    // 走 safeFetch，保留逐跳 SSRF 校验（私网/非 http(s) 一律拦截）
    const head = await safeFetch(
      url,
      { method: "HEAD", headers: { "User-Agent": UA } },
      { timeoutMs: ICON_TIMEOUT_MS }
    ).catch(() => null);
    if (head?.res.ok) return true;

    // 部分 CDN 对 HEAD 返回 405/403，回退 GET 只取首字节
    const get = await safeFetch(
      url,
      { method: "GET", headers: { "User-Agent": UA, Range: "bytes=0-0" } },
      { timeoutMs: ICON_TIMEOUT_MS }
    ).catch(() => null);
    return get?.res.ok === true;
  } catch {
    return false;
  }
}

function absoluteIconUrl(raw: string, baseUrl: string): string | null {
  try {
    const abs = new URL(raw, baseUrl).href;
    const u = new URL(abs);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return abs;
  } catch {
    return null;
  }
}

async function collectIconCandidates(domain: string, baseUrl: string, $?: CheerioAPI): Promise<string[]> {
  const candidates: string[] = [];
  const fallbackSlots = 3;
  const htmlLimit = MAX_ICON_CANDIDATES - fallbackSlots;

  if ($) {
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]',
      'meta[property="og:image"]',
    ];
    for (const sel of selectors) {
      if (candidates.length >= htmlLimit) break;
      const el = $(sel).first();
      const raw = el.attr("href") || el.attr("content");
      if (!raw) continue;
      const abs = absoluteIconUrl(raw, baseUrl);
      if (abs) candidates.push(abs);
    }
  }

  const fallback = [
    `https://${domain}/favicon.ico`,
    `https://favicon.im/${domain}`,
    `https://logo.clearbit.com/${domain}`,
  ];
  for (const f of fallback) {
    if (candidates.length >= MAX_ICON_CANDIDATES) break;
    candidates.push(f);
  }
  return [...new Set(candidates)].slice(0, MAX_ICON_CANDIDATES);
}

async function filterReachable(candidates: string[]): Promise<string[]> {
  const checks = candidates.map((u) => iconLimit(async () => ((await checkUrl(u)) ? u : null)));
  const results = await Promise.allSettled(checks);
  const ok: string[] = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) ok.push(r.value);
  }
  return ok;
}

async function resolveIcons(domain: string, baseUrl: string, $?: CheerioAPI): Promise<{ icons: string[]; icon: string }> {
  const fallbackIcon = `https://favicon.im/${domain}`;
  try {
    const candidates = await collectIconCandidates(domain, baseUrl, $);
    const deadline = new Promise<string[]>((resolve) => setTimeout(() => resolve([]), ICON_TOTAL_TIMEOUT_MS));
    const reachable = await Promise.race([filterReachable(candidates), deadline]);
    if (reachable.length > 0) {
      return { icons: reachable, icon: reachable[0] };
    }
    return { icons: [fallbackIcon], icon: fallbackIcon };
  } catch {
    return { icons: [fallbackIcon], icon: fallbackIcon };
  }
}

// 元信息提取工具：优先使用站点自有的 og 描述，避免 <title> 里的“首页 - 站点名”噪音
function getMetaContent($: CheerioAPI, key: string): string {
  return (
    $(`meta[property="${key}"]`).attr("content") ||
    $(`meta[name="${key}"]`).attr("content") ||
    ""
  ).trim();
}

function extractTag($: CheerioAPI, tag: string): string {
  return ($(tag).first().text() || "").trim();
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "请输入网址" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: "网址格式不正确" }, { status: 400 });
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "仅支持 http/https" }, { status: 400 });
    }

    const domain = parsed.hostname.replace(/^\[|\]$/g, "");
    const baseUrl = `${parsed.protocol}//${parsed.host}`;

    try {
      const { res, html } = await safeFetch(
        parsed.href,
        {
          headers: {
            "User-Agent": UA,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
        },
        { requireHtml: true }
      );

      if (!res.ok || !html) {
        const { icons, icon } = await resolveIcons(domain, baseUrl);
        return NextResponse.json({ title: domain, description: "", icons, icon });
      }

      const $ = cheerio.load(html);
      const title =
        getMetaContent($, "og:title") ||
        getMetaContent($, "twitter:title") ||
        extractTag($, "title") ||
        domain;
      const description =
        (getMetaContent($, "description") ||
          getMetaContent($, "og:description") ||
          getMetaContent($, "twitter:description") ||
          ""
        ).trim();

      // 降级拦截：抓不到任何有效信息时，交给前端手动填写，而不是返回裸域名
      if (title === domain && (!description || description.trim() === "")) {
        return NextResponse.json(
          { error: "无法从该网址提取有效信息，请手动填写" },
          { status: 422 }
        );
      }

      const { icons, icon } = await resolveIcons(domain, baseUrl, $);
      return NextResponse.json({ title, description, icons, icon });
    } catch (error) {
      if (error instanceof BlockedError) {
        console.warn("URL info blocked:", error.message, parsed.href);
        return NextResponse.json({ error: "该网址不允许抓取" }, { status: 400 });
      }
      console.error("Fetch error:", error);
      const { icons, icon } = await resolveIcons(domain, baseUrl);
      return NextResponse.json({ title: domain, description: "", icons, icon });
    }
  } catch (error) {
    console.error("Error in URL info API:", error);
    return NextResponse.json({ error: "获取网址信息失败，请检查网址是否正确" }, { status: 500 });
  }
}
