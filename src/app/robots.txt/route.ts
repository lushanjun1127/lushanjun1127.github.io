import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await prisma.siteSetting.findMany({where:{key:{in:['siteUrl','robots']}}});
  const config = Object.fromEntries(settings.map(s=>[s.key,s.value]));
  const base = new URL(config.siteUrl || 'http://localhost:3000');
  const robotsTxt = config.robots?.includes('noindex') ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /login\nDisallow: /dashboard\nSitemap: ${new URL('/sitemap.xml',base).href}\n`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
} 
