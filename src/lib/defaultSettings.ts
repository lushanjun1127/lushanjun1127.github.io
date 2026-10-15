export interface SettingItem {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  group: 'basic' | 'seo' | 'feature' | 'analytics';
  description?: string;
}

export const defaultSettings: SettingItem[] = [
  // 基础设置
  {
    key: "websiteName",
    value: "陆山君の小窝",
    type: "string",
    group: "basic",
    description: "网站名称"
  },
  {
    key: "logoUrl",
    value: "/logo.png",
    type: "string",
    group: "basic",
    description: "网站Logo (建议尺寸: 520x120px)"
  },
  {
    key: "faviconUrl",
    value: "/favicon/favicon.ico",
    type: "string",
    group: "basic",
    description: "网站图标"
  },
  {
    key: "copyrightText",
    value: "© 2026 陆山君。保留所有权利。",
    type: "string",
    group: "basic",
    description: "版权信息"
  },
  {
    key: "contactEmail",
    value: "lushanjun@proton.me",
    type: "string",
    group: "basic",
    description: "联系邮箱"
  },


  // 社交媒体链接
  {
    key: "githubUrl",
    value: "https://github.com/lushanjun1127",
    type: "string",
    group: "basic",
    description: "GitHub链接"
  },
  {
    key: "discordUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "Discord链接"
  },
  {
    key: "twitterUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "Twitter链接"
  },
  {
    key: "youtubeUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "YouTube频道链接"
  },
  {
    key: "linkedinUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "LinkedIn链接"
  },
  {
    key: "weixinUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "微信公众号链接"
  },
  {
    key: "weiboUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "微博主页链接"
  },
  {
    key: "bilibiliUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "B站主页链接"
  },
  {
    key: "zhihuUrl",
    value: "",
    type: "string",
    group: "basic",
    description: "知乎主页链接"
  },

  // SEO设置
  {
    key: "siteTitle",
    value: "陆山君の小窝 - 个人导航与书签收藏",
    type: "string",
    group: "seo",
    description: "网站标题"
  },
  {
    key: "description",
    value: "陆山君的个人导航与书签收藏，整理实用工具、优质网站和喜欢的网络资源。",
    type: "string",
    group: "seo",
    description: "网站描述"
  },
  {
    key: "keywords",
    value: "陆山君,陆山君の小窝,个人导航,书签收藏,实用工具,优质网站",
    type: "string",
    group: "seo",
    description: "关键词(用逗号分隔)"
  },
  {
    key: "siteUrl",
    value: "http://localhost:3000",
    type: "string",
    group: "seo",
    description: "网站URL"
  },
  {
    key: "ogImage",
    value: "/og-image.png",
    type: "string",
    group: "seo",
    description: "社交分享图片"
  },
  {
    key: "robots",
    value: "index, follow",
    type: "string",
    group: "seo",
    description: "搜索引擎爬虫设置"
  },
  {
    key: "author",
    value: "陆山君",
    type: "string",
    group: "seo",
    description: "作者信息"
  },

  // 统计分析
  {
    key: "googleAnalyticsId",
    value: "",
    type: "string",
    group: "analytics",
    description: "谷歌分析标识"
  },
  {
    key: "clarityId",
    value: "",
    type: "string",
    group: "analytics",
    description: "微软 Clarity 标识"
  },
  {
    key: "umamiId",
    value: "",
    type: "string",
    group: "analytics",
    description: "Umami 统计标识"
  },
  {
    key: "plausibleId",
    value: "",
    type: "string",
    group: "analytics",
    description: "Plausible 统计标识"
  },
  {
    key: "gtagId",
    value: "",
    type: "string",
    group: "analytics",
    description: "谷歌代码标识"
  },

  // 功能设置
  {
    key: "enableSearch",
    value: "true",
    type: "boolean",
    group: "feature",
    description: "启用搜索功能"
  },
  {
    key: "enableBackToTop",
    value: "true",
    type: "boolean",
    group: "feature",
    description: "启用返回顶部按钮"
  },
  {
    key: "enableSidebarAds",
    value: "false",
    type: "boolean",
    group: "feature",
    description: "启用侧边栏广告"
  },
  {
    key: "sidebarAdsContent",
    value: "",
    type: "string",
    group: "feature",
    description: "侧边栏广告内容"
  },
  {
    key: "enableCtaButton",
    value: "true",
    type: "boolean",
    group: "feature",
    description: "启用CTA按钮"
  },
  {
    key: "ctaButtonText",
    value: "管理我的收藏",
    type: "string",
    group: "feature",
    description: "CTA按钮文字"
  },
  {
    key: "ctaButtonLink",
    value: "/admin/collections",
    type: "string",
    group: "feature",
    description: "CTA按钮链接"
  },
  {
    key: "ctaButtonStyle",
    value: "primary",
    type: "string",
    group: "feature",
    description: "CTA按钮样式"
  },
  {
    key: "enableHeroBanner",
    value: "true",
    type: "boolean",
    group: "feature",
    description: "启用Hero Banner"
  },
  {
    key: "heroBannerTitle",
    value: "欢迎来到陆山君の小窝",
    type: "string",
    group: "feature",
    description: "Hero Banner标题"
  },
  {
    key: "heroBannerDescription",
    value: "收藏喜欢的网站，分享值得发现的资源。",
    type: "string",
    group: "feature",
    description: "Hero Banner描述"
  },
  {
    key: "heroBannerImage",
    value: "",
    type: "string",
    group: "feature",
    description: "Hero Banner图片"
  },
  {
    key: "heroBannerButtonText",
    value: "联系陆山君",
    type: "string",
    group: "feature",
    description: "Hero Banner按钮文字"
  },
  {
    key: "heroBannerButtonLink",
    value: "mailto:lushanjun@proton.me",
    type: "string",
    group: "feature",
    description: "Hero Banner按钮链接"
  },
  {
    key: "heroBannerSponsorText",
    value: "",
    type: "string",
    group: "feature",
    description: "Hero Banner赞助商文本"
  },
  {
    key: "enableBanner",
    value: "false",
    type: "boolean",
    group: "feature",
    description: "启用普通Banner"
  },
  {
    key: "bannerContent",
    value: "",
    type: "string",
    group: "feature",
    description: "Banner内容"
  },
  {
    key: "bannerStyle",
    value: "info",
    type: "string",
    group: "feature",
    description: "Banner样式"
  },
  {
    key: "enableCarousel",
    value: "false",
    type: "boolean",
    group: "feature",
    description: "启用轮播"
  },
  // {
  //   key: "carouselItems",
  //   value: "[]",
  //   type: "json",
  //   group: "feature",
  //   description: "轮播项目"
  // },
  {
    key: "carouselImageStates",
    value: "[true,true,true,true,true,true]",
    type: "json",
    group: "feature",
    description: "轮播图片显示状态"
  },
  {
    key: "carouselImages",
    value: "",
    type: "string",
    group: "feature",
    description: "轮播图片"
  },
  {
    key: "carouselImageHyperlinks",
    value: "/|/|/|/|/|/",
    type: "json",
    group: "feature",
    description: "轮播图片跳转链接"
  },
  {
    key: "enableTopBanner",
    value: "false",
    type: "boolean",
    group: "feature",
    description: "启用顶部通知Banner"
  },
  {
    key: "topBannerTitle",
    value: "欢迎来到陆山君の小窝",
    type: "string",
    group: "feature",
    description: "Banner标题"
  },
  {
    key: "topBannerDescription",
    value: "这里收藏了实用工具、优质网站和我喜欢的网络资源。",
    type: "string",
    group: "feature",
    description: "Banner描述"
  },
  {
    key: "topBannerButtonText",
    value: "我的 GitHub",
    type: "string",
    group: "feature",
    description: "Banner按钮文本"
  },
  {
    key: "topBannerButtonLink",
    value: "https://github.com/lushanjun1127",
    type: "string",
    group: "feature",
    description: "Banner按钮链接"
  },
  {
    key: "sidebarAdsTitle",
    value: "发现我的收藏",
    type: "string",
    group: "feature",
    description: "侧边栏广告标题"
  },
  {
    key: "sidebarAdsDescription",
    value: "整理实用网站，分享值得收藏的网络资源。",
    type: "string",
    group: "feature",
    description: "侧边栏广告描述"
  },
  {
    key: "sidebarAdsImageUrl",
    value: "/assets/spaces-preview.png",
    type: "string",
    group: "feature",
    description: "侧边栏广告图片"
  },
  {
    key: "sidebarAdsButtonText",
    value: "我的 GitHub",
    type: "string",
    group: "feature",
    description: "侧边栏广告按钮文本"
  },
  {
    key: "sidebarAdsButtonUrl",
    value: "https://github.com/lushanjun1127",
    type: "string",
    group: "feature",
    description: "侧边栏广告按钮链接"
  }
];

export const defaultImages = [
  {
    name: "logo.png",
    image: "/default-images/logo.png",
    type: "default",
    settingKeys: [
      {
        key: "logoUrl",
      },
    ],
  },
  {
    name: "favicon.ico",
    image: "/default-images/favicon.ico",
    type: "default",
    settingKeys: [
      {
        key: "faviconUrl",
      },
    ],
  },
  {
    name: "og-image.png",
    image: "/default-images/og-image.png",
    type: "default",
    settingKeys: [
      {
        key: "ogImage",
      },
    ],
  },
  {
    name: "spaces-preview.png",
    image: "/default-images/spaces-preview.png",
    type: "default",
    settingKeys: [
      {
        key: "sidebarAdsImageUrl",
      },
    ],
  },
  {
    name: "carousel-images",
    images: [
      "/default-images/carousel-1.jpg",
      "/default-images/carousel-2.jpg", 
      "/default-images/carousel-3.jpg",
      "/default-images/carousel-4.jpg",
      "/default-images/carousel-5.jpg",
      "/default-images/carousel-6.jpg"
    ],
    type: "default",
    settingKeys: [
      {
        key: "carouselImages",
      },
    ],
  }
];
