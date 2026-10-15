import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings,collections] = await Promise.all([prisma.siteSetting.findMany({where:{key:{in:['siteUrl','robots']}}}),prisma.collection.findMany({where:{isPublic:true},select:{slug:true,updatedAt:true}})]);
  const config = Object.fromEntries(settings.map(s=>[s.key,s.value]));
  if (config.robots?.includes('noindex')) return [];
  const base = new URL(config.siteUrl || 'http://localhost:3000');
  return [{url:base.href,changeFrequency:'weekly',priority:1},...collections.filter(c=>c.slug).map(c=>{const url=new URL(base);url.searchParams.set('collection',c.slug!);return {url:url.href,lastModified:c.updatedAt,changeFrequency:'weekly' as const,priority:0.8};})];
}
