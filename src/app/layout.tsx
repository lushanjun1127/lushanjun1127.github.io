
import { prisma } from "@/lib/prisma";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { Toaster as SonnerToaster } from "sonner";
import { defaultSettings } from "@/lib/defaultSettings";
import { cache } from 'react'
import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'

async function checkSiteSettingTableExists() {
  const result: any = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE  table_schema = current_schema()
      AND    table_name   = 'SiteSetting'
    );
  `;
  return result[0].exists;
}

export const generateMetadata = async (): Promise<Metadata> => {
  try {
    const tableExists = await checkSiteSettingTableExists();
    const keys = ["websiteName", "siteTitle", "author", "robots", "description", "keywords", "siteUrl", "faviconUrl", "ogImage"];
    let settings: any = [];
    if (tableExists) {
      settings = await prisma.siteSetting.findMany({
        where: {
          key: {
            in: [...keys],
          },
        },
      });
    } 

    // console.log(settings)

    settings = settings.length > 0 ? settings : defaultSettings.filter((setting) =>
      keys.includes(setting.key)
    );

    const settingsMap = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // const faviconBase =
    //   settingsMap.faviconUrl?.replace("favicon.ico", "") || "/favicon/";
    const siteUrl =
      settingsMap.siteUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";


    const imageBaseUrl = '/api/images/'


    const faviconSetting = settings.find((setting: any) => setting.key === 'faviconUrl');
    const faviconId = faviconSetting ? 
      (await prisma.settingImage.findFirst({
        where: { settingId: faviconSetting.id },
        select: { imageId: true }
      }))?.imageId || '' : '';
    const faviconUrl = faviconId ? `${imageBaseUrl}${faviconId}` : '/favicon/favicon.ico'

    return {
      title:
        settingsMap.siteTitle || settingsMap.websiteName,
      authors: [{ name: settingsMap.author || '陆山君' }],
      description:
        settingsMap.description,
      keywords:
        settingsMap.keywords,
      metadataBase: new URL(siteUrl),
      robots: { index: !settingsMap.robots?.includes('noindex'), follow: !settingsMap.robots?.includes('nofollow') },
      twitter: { card:'summary_large_image', title:settingsMap.siteTitle || settingsMap.websiteName, description:settingsMap.description, images:[settingsMap.ogImage || '/og-image.png'] },
      openGraph: {
        title: settingsMap.siteTitle || settingsMap.websiteName,
        description: settingsMap.description,
        siteName: settingsMap.websiteName,
        locale: 'zh_CN',
        images: [settingsMap.ogImage || '/og-image.png'],
      },
      alternates: {
        canonical: siteUrl,
      },
      icons: {
        icon: [
          {
            url: faviconUrl,
            sizes: "32x32",
            type: "image/x-icon",
          },
          // {
          //   url: `${faviconBase}favicon-16x16.png`,
          //   sizes: "16x16",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-32x32.png`,
          //   sizes: "32x32",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-192x192.png`,
          //   sizes: "192x192",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-512x512.png`,
          //   sizes: "512x512",
          //   type: "image/png",
          // },
        // apple: [
        //   {
        //     url: `${faviconBase}favicon-180x180.png`,
        //     sizes: "180x180",
        //     type: "image/png",
        //   },
        // ],
        ],
      },
    };
  } catch (error) {
    console.error("获取设置失败:", error);
    return {
      title: "陆山君の小窝 - 个人导航与书签收藏",
      description:
        "陆山君的个人导航与书签收藏，整理实用工具、优质网站和喜欢的网络资源。",
      keywords:
        "书签管理,书签整理,书签集合,书签分享,效率工具,网站整理,链接管理,书签标签,智能书签",
      icons: {
        icon: "/favicon/favicon.ico",
      },
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let analyticsMap: any = {
    googleAnalyticsId: "",
    clarityId: "",
  };

  if (process.env.NODE_ENV === "production") {
    try {
      const tableExists = await checkSiteSettingTableExists();
      if (tableExists) {
        // 获取统计代码ID
        const analytics = await prisma.siteSetting.findMany({
          where: {
            key: {
              in: ["googleAnalyticsId", "clarityId"],
            },
          },
        });

        if (analytics.length > 0) {
          analyticsMap = analytics.reduce((acc: any, setting: any) => {
            acc[setting.key] = setting.value || "";
            return acc;
          }, {} as Record<string, string>);
        }
      }
    } catch (error) {
      console.error("获取统计设置失败，已降级为无统计代码:", error);
    }
  }

  return (
    <html lang="zh-CN" translate="no" className="notranslate" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
        <SonnerToaster />
        <Analytics clarityId={analyticsMap.clarityId} />
        {!!analyticsMap.googleAnalyticsId && <GoogleAnalytics gaId={analyticsMap.googleAnalyticsId} />}
      </body>
    </html>
  );
}
