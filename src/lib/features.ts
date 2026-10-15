export type AdPlacement = 'header' | 'sidebar' | 'footer';
export interface SiteAd { id: string; title: string; description: string; url: string; imageUrl: string; placement: AdPlacement; enabled: boolean; }
export const featureDefaults = { enableSearch: 'true', enableAISearch: 'true', enableLocalAnalytics: 'true', multiAds: '[]' };
export function safeLink(value: string, image = false) {
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try { const url = new URL(value); return ['https:', 'http:', ...(!image ? ['mailto:'] : [])].includes(url.protocol) ? value : ''; } catch { return ''; }
}
export function parseAds(value: string): SiteAd[] {
  try {
    const ads = JSON.parse(value);
    if (!Array.isArray(ads)) return [];
    return ads.filter((a) => a && typeof a.title === 'string' && ['header','sidebar','footer'].includes(a.placement)).map((a, i) => ({
      id: String(a.id || i), title: a.title.slice(0, 100), description: String(a.description || '').slice(0, 500),
      url: safeLink(String(a.url || '')), imageUrl: safeLink(String(a.imageUrl || ''), true), placement: a.placement, enabled: a.enabled === true,
    }));
  } catch { return []; }
}
