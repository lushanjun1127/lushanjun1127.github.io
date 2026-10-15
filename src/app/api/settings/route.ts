import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { defaultSettings } from '@/lib/defaultSettings';
import { featureDefaults } from '@/lib/features';
import { safeLink } from '@/lib/features';


export const runtime = 'nodejs';
// 增加超时时间到最大值
export const maxDuration = 60; // Vercel Hobby 允许的最大时间是 60 秒
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    
    // 获取所有设置
    const settings = group 
      ? await prisma.siteSetting.findMany({ where: { group } })
      : await prisma.siteSetting.findMany();

    
    // 将设置转换为键值对格式
    const formattedSettings = settings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {});


    // 合并默认值和数据库值
    const result = {
      ...Object.fromEntries(defaultSettings.filter(s => !group || s.group === group).map(s => [s.key, s.value])),
      ...(!group || group === 'feature' ? featureDefaults : {}),
      ...formattedSettings,
    };


    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ 
      error: '获取设置失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const data = await request.json();
    if (data.siteUrl) {
      try {
        const url = new URL(data.siteUrl);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch { return NextResponse.json({error:'网站地址必须为有效的 http:// 或 https:// 地址'},{status:400}); }
    }
    if (data.ogImage && !safeLink(data.ogImage, true)) return NextResponse.json({error:'分享图片地址无效'},{status:400});
    // console.log('接收到的数据:', data);

    try {
      const updatedSettings = [];

      for (const [key, value] of Object.entries(data)) {
        const existingSetting = await prisma.siteSetting.findUnique({
          where: { key }
        });
      
        if (existingSetting) {
          const updated = await prisma.siteSetting.update({
            where: { key },
            data: {
              value: String(value)
            }
          });
          updatedSettings.push(updated);
        }
      }



      return NextResponse.json({ 
        message: '设置已保存',
        results: updatedSettings
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json({ 
        error: '数据库操作失败',
        details: dbError instanceof Error ? dbError.message : '未知错误'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: '保存设置失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
