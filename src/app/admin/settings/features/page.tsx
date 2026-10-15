'use client';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { featureDefaults, parseAds, type SiteAd } from '@/lib/features';
import { toast } from 'sonner';

export default function FeaturesPage() {
  const [settings, setSettings] = useState(featureDefaults);
  const [ads, setAds] = useState<SiteAd[]>([]);
  const [busy, setBusy] = useState(true);
  useEffect(() => { fetch('/api/settings?group=feature').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => { setSettings({ ...featureDefaults, ...data }); setAds(parseAds(data.multiAds || '[]')); }).catch(() => toast.error('加载功能设置失败')).finally(() => setBusy(false)); }, []);
  const update = (id: string, value: Partial<SiteAd>) => setAds(prev => prev.map(a => a.id === id ? { ...a, ...value } : a));
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try { const r = await fetch('/api/features', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ ...settings, multiAds: JSON.stringify(ads) }) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); toast.success('功能设置已保存，刷新前台即可查看'); } catch(e) { toast.error(e instanceof Error ? e.message : '保存失败'); } finally { setBusy(false); }
  }
  return <><AdminHeader title="功能与广告" /><form onSubmit={save} className="mx-auto w-full max-w-4xl space-y-6 overflow-y-auto p-6">
    <section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-lg font-semibold">功能开关</h2>
      {([['enableSearch','书签搜索'],['enableAISearch','智能搜索入口'],['enableLocalAnalytics','本站访问统计']] as const).map(([key,label]) => <label key={key} className="flex items-center justify-between"><span>{label}</span><Switch disabled={busy} checked={settings[key] === 'true'} onCheckedChange={checked => setSettings(prev => ({ ...prev, [key]:String(checked) }))} /></label>)}
      <p className="text-sm text-muted-foreground">智能搜索将关键词交给你选择的外部搜索服务，在新窗口显示结果。本站统计记录访问量、匿名访客和书签点击，不记录原始 IP。</p>
    </section>
    <section className="space-y-4 rounded-2xl border bg-white p-6"><div className="flex justify-between"><h2 className="text-lg font-semibold">多个广告位</h2><Button disabled={busy} type="button" variant="outline" onClick={() => setAds(prev => [...prev, { id:crypto.randomUUID(), title:'', description:'', url:'', imageUrl:'', placement:'sidebar', enabled:false }])}>添加广告</Button></div>
      <p className="text-sm text-muted-foreground">可在内容顶部、侧边栏和页脚投放多个广告；列表顺序即展示顺序。</p>
      {ads.length === 0 && <p>暂无广告，添加后开启即可展示。</p>}
      {ads.map((ad,index) => <fieldset key={ad.id} disabled={busy} className="space-y-3 rounded-xl border p-4"><div className="flex items-center justify-between"><span>广告 {index + 1}</span><div className="flex items-center gap-3"><label className="flex items-center gap-2">启用<Switch checked={ad.enabled} onCheckedChange={enabled => update(ad.id,{ enabled })} /></label><Button variant="ghost" type="button" onClick={() => setAds(prev => prev.filter(a => a.id !== ad.id))}>删除</Button></div></div>
        <label className="block">标题<Input value={ad.title} onChange={e => update(ad.id,{ title:e.target.value })} /></label>
        <label className="block">介绍<Input value={ad.description} onChange={e => update(ad.id,{ description:e.target.value })} /></label>
        <label className="block">跳转链接<Input placeholder="https://example.com" value={ad.url} onChange={e => update(ad.id,{ url:e.target.value })} /></label>
        <label className="block">图片地址（可选）<Input value={ad.imageUrl} onChange={e => update(ad.id,{ imageUrl:e.target.value })} /></label>
        <label className="flex items-center gap-3">展示位置<select className="rounded-lg border p-2" value={ad.placement} onChange={e => update(ad.id,{ placement:e.target.value as SiteAd['placement'] })}><option value="header">内容顶部</option><option value="sidebar">侧边栏</option><option value="footer">页脚上方</option></select></label>
        <div className="flex gap-2"><Button type="button" variant="outline" disabled={index === 0} onClick={() => setAds(prev => { const next=[...prev]; [next[index-1],next[index]]=[next[index],next[index-1]]; return next; })}>上移</Button><Button type="button" variant="outline" disabled={index === ads.length-1} onClick={() => setAds(prev => { const next=[...prev]; [next[index+1],next[index]]=[next[index],next[index+1]]; return next; })}>下移</Button></div>
      </fieldset>)}
    </section><Button disabled={busy} type="submit">{busy ? '处理中…' : '保存设置'}</Button>
  </form></>;
}
