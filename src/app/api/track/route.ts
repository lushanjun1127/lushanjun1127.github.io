import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { canReadCollection, visibleFolderIds } from '@/lib/auth/collection-access';
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin && new URL(origin).host !== request.headers.get('host')) return new NextResponse(null, {status:403});
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
