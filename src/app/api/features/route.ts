import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { featureDefaults, parseAds } from '@/lib/features';

export async function POST(request: Request) {
  const data = await request.json();
  if (typeof data.multiAds !== 'string') return NextResponse.json({ error: '广告配置格式不正确' }, { status: 400 });
  const ads = parseAds(data.multiAds);
  let original;
  try { original = JSON.parse(data.multiAds); } catch { return NextResponse.json({ error: '广告配置格式不正确' }, { status: 400 }); }
  if (!Array.isArray(original) || original.length !== ads.length || ads.some(a => a.enabled && (!a.title.trim() || !a.url))) {
    return NextResponse.json({ error: '每个启用的广告都需要标题及有效链接' }, { status: 400 });
  }
  const settings = Object.keys(featureDefaults).map(key => ({ key, value: key === 'multiAds' ? JSON.stringify(ads) : String(data[key] === 'true'), type: key === 'multiAds' ? 'json' : 'boolean', group: 'feature' }));
  await prisma.$transaction(settings.map(setting => prisma.siteSetting.upsert({ where: { key: setting.key }, update: { value: setting.value }, create: setting })));
  return NextResponse.json({ message: '功能设置已保存' });
}
