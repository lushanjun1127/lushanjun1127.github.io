'use client';
import { useState,useEffect } from 'react';
import { AdminHeader } from '@/components/admin/header';
import { Button } from '@/components/ui/button';
type Report = { totals:{views:number;visitors:number;clicks:number}; daily:{day:string;views:number;visitors:number}[];pages:{path:string;count:number}[];clicks:{id?:string;title?:string;url?:string;count:number}[];collections:{id:string;name:string;viewCount:number;isPublic:boolean}[] };
export default function AnalyticsPage() {
  const [days,setDays] = useState(30), [report,setReport] = useState<Report|null>(null), [error,setError] = useState('');
  const [refresh,setRefresh] = useState(0);
  useEffect(()=>{let active=true;setError('');fetch(`/api/admin/analytics?days=${days}`).then(r=>{if(!r.ok)throw new Error('获取统计失败');return r.json();}).then(d=>{if(active)setReport(d);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[days,refresh]);
  return <><AdminHeader title="访问统计"/><main className="space-y-6 overflow-y-auto p-6"><div className="flex items-center gap-4"><label>统计范围 <select value={days} onChange={e=>setDays(Number(e.target.value))} className="rounded-lg border p-2">{[7,30,90].map(n=><option key={n} value={n}>最近 {n} 天</option>)}</select></label><Button variant="outline" onClick={()=>setRefresh(n=>n+1)}>刷新</Button></div><p className="text-sm text-muted-foreground">从启用统计后开始记录，日期按北京时间显示。独立访客按浏览器匿名标识估算，清除 Cookie 或换浏览器会重复计数。</p>{error && <p role="alert">{error}</p>}{!report && !error && <p>加载统计中…</p>}{report && <>
    <div className="grid gap-4 sm:grid-cols-3">{[['页面访问',report.totals.views],['独立访客',report.totals.visitors],['书签点击',report.totals.clicks]].map(([label,value])=><div key={label} className="rounded-2xl border bg-card p-6"><p>{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>)}</div>
    <section className="rounded-xl border p-4"><h2 className="mb-4 font-semibold">每日访问</h2>{report.daily.length===0?<p>暂无访问数据</p>:<table className="w-full text-left"><thead><tr><th>日期</th><th>访问量</th><th>独立访客</th></tr></thead><tbody>{report.daily.map(d=><tr key={d.day}><td>{d.day}</td><td><div className="my-1 rounded bg-emerald-100 px-2" style={{width:`${Math.max(8,d.views/Math.max(...report.daily.map(x=>x.views))*100)}%`}}>{d.views}</div></td><td>{d.visitors}</td></tr>)}</tbody></table>}</section>
    <section className="rounded-xl border p-4"><h2 className="mb-3 font-semibold">热门书签（所选时段）</h2>{!report.clicks.length&&<p>暂无点击</p>}{report.clicks.map((b,i)=><div key={b.id||i} className="flex justify-between border-b py-3"><span>{b.title||'已删除的书签'}</span><span>{b.count} 次</span></div>)}</section>
    <section className="rounded-xl border p-4"><h2 className="mb-3 font-semibold">集合累计访问</h2>{report.collections.map(c=><div key={c.id} className="flex justify-between border-b py-3"><span>{c.name}（{c.isPublic?'公开':'私密'}）</span><span>{c.viewCount} 次</span></div>)}</section>
    <section className="rounded-xl border p-4"><h2 className="mb-3 font-semibold">热门页面（所选时段）</h2>{report.pages.map(p=><div key={p.path} className="flex justify-between gap-3 border-b py-3"><span className="break-all">{report.collections.find(c=>p.path===`/?collection=${c.id}`)?.name||p.path}</span><span>{p.count} 次</span></div>)}</section>
  </>}</main></>;
}
