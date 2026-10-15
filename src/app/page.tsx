import type { Metadata } from 'next';
import SiteHome from '@/components/website/home-page';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ searchParams }: { searchParams: { collection?: string; folderId?: string } }): Promise<Metadata> {
  if (!searchParams.collection) return {};
  const [collection,settings] = await Promise.all([
    prisma.collection.findFirst({where:{slug:searchParams.collection,isPublic:true},select:{name:true,description:true,slug:true}}),
    prisma.siteSetting.findMany({where:{key:{in:['siteUrl','websiteName','description']}}}),
  ]);
  if (!collection) return {title:'私密或不存在的收藏',robots:{index:false,follow:false}};
  const config = Object.fromEntries(settings.map(s=>[s.key,s.value]));
  const url = new URL(config.siteUrl || 'http://localhost:3000');
  url.searchParams.set('collection',collection.slug!);
  const title = `${collection.name} - ${config.websiteName || '陆山君の小窝'}`;
  const description = collection.description || config.description || '';
  return {title,description,alternates:{canonical:url.href},openGraph:{title,description,url:url.href,siteName:config.websiteName || '陆山君の小窝',locale:'zh_CN',images:[new URL('/og-image.png',url).href]},twitter:{card:'summary_large_image',title,description}};
}
export default function Page() { return <SiteHome />; }
