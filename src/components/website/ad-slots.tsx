'use client';
import { useSettings } from '@/hooks/use-settings';
import { parseAds, safeLink, type AdPlacement } from '@/lib/features';
export function AdSlots({ placement }: { placement: AdPlacement }) {
  const { settings, loading } = useSettings('feature');
  if (loading) return null;
  const ads = parseAds(settings.multiAds || '[]').filter(a => a.enabled && a.placement === placement && a.url);
  if (placement === 'sidebar' && settings.enableSidebarAds === 'true' && safeLink(settings.sidebarAdsButtonUrl || '')) ads.push({ id:'legacy-sidebar', title:settings.sidebarAdsTitle, description:settings.sidebarAdsDescription, url:settings.sidebarAdsButtonUrl, imageUrl:safeLink(settings.sidebarAdsImageUrl || '',true), placement, enabled:true });
  if (!ads.length) return null;
  return <aside aria-label="广告" className="space-y-3 p-4">{ads.map(ad => <a key={ad.id} href={ad.url} target="_blank" rel="sponsored noopener noreferrer" className="block rounded-xl border bg-card p-4"><span className="text-xs text-muted-foreground">广告</span>{ad.imageUrl && <img src={ad.imageUrl} alt="" className="my-2 max-h-48 w-full rounded-lg object-contain" />}<p className="font-medium">{ad.title}</p>{ad.description && <p className="mt-1 text-sm text-muted-foreground">{ad.description}</p>}</a>)}</aside>;
}
