import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { DefaultSession } from "next-auth";
import { getAuthSecret } from '@/lib/auth/secret';
import bcrypt from "bcryptjs";

// 登录速率限制（内存级，单实例有效；多实例部署请改用 Redis 等外部存储）
const MAX_ATTEMPTS = 5;          // 每个邮箱在窗口期内最多尝试次数
const WINDOW_MS = 15 * 60 * 1000; // 15 分钟窗口
const LOCKOUT_MS = 30 * 60 * 1000; // 触发上限后锁定 30 分钟

interface AttemptRecord { count: number; firstAttempt: number; lockedUntil?: number; }
const attempts = new Map<string, AttemptRecord>();

function cleanupAttempts() {
  const now = Date.now();
  for (const [key, record] of attempts) {
    if (now - record.firstAttempt > Math.max(WINDOW_MS, LOCKOUT_MS) &&
        (!record.lockedUntil || record.lockedUntil <= now)) {
      attempts.delete(key);
    }
  }
}

function checkRateLimit(email: string): { allowed: boolean; retryAfterMs?: number } {
  cleanupAttempts();
  const now = Date.now();
  const record = attempts.get(email.toLowerCase());
  if (record?.lockedUntil && record.lockedUntil > now) {
    return { allowed: false, retryAfterMs: record.lockedUntil - now };
  }
  return { allowed: true };
}

function recordFailedAttempt(email: string) {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttempt: now });
    return;
  }
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
}

function clearAttempts(email: string) {
  attempts.delete(email.toLowerCase());
}

// 使用 bcrypt 的安全比较，避免明文比较带来的时序侧信道风险
async function safeCompare(input: string, stored: string): Promise<boolean> {
  if (!input || !stored) return false;
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
    return bcrypt.compare(input, stored);
  }
  // 兼容尚未迁移到哈希的旧明文环境变量：先哈希再比较，保持恒定耗时
  const hashed = await bcrypt.hash(stored, 10);
  return bcrypt.compare(input, hashed);
}

// 扩展 Session 类型
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  get secret() {
    return getAuthSecret();
  },
  providers: [
    CredentialsProvider({
      name: "邮箱和密码",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        // 速率限制：防止暴力破解
        const rate = checkRateLimit(credentials.email);
        if (!rate.allowed) {
          const minutes = Math.max(1, Math.ceil((rate.retryAfterMs || 0) / 60000));
          throw new Error(`尝试次数过多，请在 ${minutes} 分钟后重试`);
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        // 推荐配置 ADMIN_PASSWORD_HASH（bcrypt 哈希），可用 pnpm generate-hash 生成
        // 仍兼容旧的明文 ADMIN_PASSWORD，但会提示迁移
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
        const adminPasswordPlain = process.env.ADMIN_PASSWORD;

        if (!adminEmail || (!adminPasswordHash && !adminPasswordPlain)) {
          console.error("登录失败：未配置 ADMIN_EMAIL 或 ADMIN_PASSWORD_HASH/ADMIN_PASSWORD");
          throw new Error("服务器未正确配置管理员账号");
        }

        const storedHash = adminPasswordHash || adminPasswordPlain || "";
        const emailMatches = await safeCompare(credentials.email, adminEmail);
        const passwordMatches = await safeCompare(credentials.password, storedHash);

        if (!emailMatches || !passwordMatches) {
          recordFailedAttempt(credentials.email);
          throw new Error("邮箱或密码不正确");
        }

        clearAttempts(credentials.email);
        return {
          id: "admin",
          email: adminEmail,
          name: "管理员"
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      return token;
    },
  }
};
