import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  // 服务端鉴权：不依赖 Middleware 白名单，防止漏配导致统计数据泄露
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '请先登录管理后台' }, { status: 401 });
  }
  const days = Math.max(1,Math.min(90,Number(new URL(request.url).searchParams.get('days')) || 30));
  const since = new Date(Date.now() - days*86400000);
  const [totals,daily,pages,clicks,collections] = await Promise.all([
    prisma.$queryRaw<Array<{views:bigint; visitors:bigint; clicks:bigint}>>`SELECT COUNT(*) FILTER (WHERE path NOT LIKE '/out/%') AS views, COUNT(DISTINCT ip) FILTER (WHERE path NOT LIKE '/out/%') AS visitors, COUNT(*) FILTER (WHERE path LIKE '/out/%') AS clicks FROM "AccessLog" WHERE "createdAt" >= ${since}`,
    prisma.$queryRaw<Array<{day:string; views:bigint; visitors:bigint}>>`SELECT TO_CHAR("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS day, COUNT(*) AS views, COUNT(DISTINCT ip) AS visitors FROM "AccessLog" WHERE "createdAt" >= ${since} AND path NOT LIKE '/out/%' GROUP BY day ORDER BY day`,
    prisma.accessLog.groupBy({by:['path'],where:{createdAt:{gte:since},NOT:{path:{startsWith:'/out/'}}},_count:{_all:true},orderBy:{_count:{path:'desc'}},take:10}),
    prisma.accessLog.groupBy({by:['path'],where:{createdAt:{gte:since},path:{startsWith:'/out/'}},_count:{_all:true},orderBy:{_count:{path:'desc'}},take:10}),
    prisma.collection.findMany({select:{id:true,name:true,viewCount:true,isPublic:true},orderBy:{viewCount:'desc'},take:20}),
  ]);
  const ids = clicks.map(c=>c.path.slice(5));
  const bookmarks = await prisma.bookmark.findMany({where:{id:{in:ids}},select:{id:true,title:true,url:true}});
  return NextResponse.json({days,totals:{views:Number(totals[0].views),visitors:Number(totals[0].visitors),clicks:Number(totals[0].clicks)},daily:daily.map(d=>({...d,views:Number(d.views),visitors:Number(d.visitors)})),pages:pages.map(p=>({path:p.path,count:p._count._all})),clicks:clicks.map(c=>({...bookmarks.find(b=>b.id===c.path.slice(5)),count:c._count._all})),collections});
}
