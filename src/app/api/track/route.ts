import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { canReadCollection, visibleFolderIds } from '@/lib/auth/collection-access';
import { cleanupAccessLogs } from '@/lib/analytics/cleanup';

// 埋点速率限制（内存级，单实例有效）：按访客 Cookie / IP 计数
const TRACK_WINDOW_MS = 60 * 1000; // 1 分钟窗口
const TRACK_MAX_PER_WINDOW = 60;   // 每窗口最多 60 次
interface TrackRecord { count: number; firstAt: number; }
const trackCounts = new Map<string, TrackRecord>();

function allowTrack(key: string): boolean {
  const now = Date.now();
  // 简单清理过期记录，防止 Map 无限增长
  if (trackCounts.size > 10000) {
    for (const [k, r] of trackCounts) if (now - r.firstAt > TRACK_WINDOW_MS) trackCounts.delete(k);
  }
  const record = trackCounts.get(key);
  if (!record || now - record.firstAt > TRACK_WINDOW_MS) {
    trackCounts.set(key, { count: 1, firstAt: now });
    return true;
  }
  if (record.count >= TRACK_MAX_PER_WINDOW) return false;
  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin && new URL(origin).host !== request.headers.get('host')) return new NextResponse(null, {status:403});
  const visitorHint = request.cookies.get('site-visitor')?.value || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!allowTrack(visitorHint)) return new NextResponse(null, { status: 429 });
  // 顺带触发过期访问日志清理（内部已节流为每 6 小时一次，不阻塞响应主流程）
  void cleanupAccessLogs();
  const enabled = await prisma.siteSetting.findUnique({ where:{key:'enableLocalAnalytics'} });
  if (enabled?.value === 'false') return new NextResponse(null,{status:204});
  let data;
  try { data = await request.json(); } catch { return NextResponse.json({error:'请求格式不正确'},{status:400}); }
  if (!['page','click'].includes(data.type)) return new NextResponse(null,{status:400});
  const bookmark = data.type === 'click' && typeof data.bookmarkId === 'string' ? await prisma.bookmark.findUnique({ where:{id:data.bookmarkId} }) : null;
  const collectionId = bookmark?.collectionId || data.collectionId;
  if (typeof collectionId !== 'string' || !await canReadCollection(collectionId) || (data.type === 'click' && !bookmark)) return new NextResponse(null,{status:404});
  if (bookmark?.folderId) {
    const visibleIds = await visibleFolderIds(collectionId);
    if (visibleIds && !visibleIds.includes(bookmark.folderId)) return new NextResponse(null,{status:404});
  }
  const existing = request.cookies.get('site-visitor')?.value;
  const visitor = existing && /^[a-f0-9-]{36}$/.test(existing) ? existing : randomUUID();
  const path = data.type === 'click' ? `/out/${bookmark!.id}` : `/?collection=${collectionId}`;
  await prisma.$transaction(async tx => {
    await tx.accessLog.create({ data:{ ip:visitor, userAgent:(request.headers.get('user-agent') || '').slice(0,300), path } });
    if (data.type === 'click') await tx.bookmark.update({where:{id:bookmark!.id},data:{viewCount:{increment:1}}});
    else await tx.collection.update({where:{id:collectionId},data:{viewCount:{increment:1}}});
  });
  const response = new NextResponse(null,{status:204});
  response.cookies.set('site-visitor',visitor,{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',maxAge:60*60*24*365,path:'/'});
  return response;
}
