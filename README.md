# 陆山君の小窝

本项目基于 MIT 许可的 Pintree 修改。当前扩展功能见 [FEATURES.md](./FEATURES.md)，原始版权与许可见 [LICENSE](./LICENSE) 和 [第三方声明](./THIRD_PARTY_NOTICES.md)。

以下保留上游项目的介绍和参考链接。

<div align="center">

[English](./README.md) | [简体中文](./README-zh.md)

  <h3>Pintree - Turn Your Browser Bookmarks into a Directory Website</h3>
  <p>Create and monetize your own directory website from browser bookmarks in minutes.</p>
</div>

## 🔗 Links

- [Pintree Official Website](https://pintree.io)
- [Demo](https://demo.pintree.io)
- [Documentation](https://docs.pintree.io)
- [Changelog](https://docs.pintree.io/en/changelog)

## ✨ Features

### Basic Version (Free)
- 📑 Unlimited Import/Export Bookmarks
- 📁 Bookmark Management
- 🎨 Basic Theme Customization
- 🔍 Bookmark Search

### [Professional Version (PRO)](https://www.pintree.io/#pricing)
- 📑 All Basic Version Features
- 📚 Multiple Collection Switching
- 🔒 Private Collections
- 📢 Multiple Ad Space Configuration
- 🤖 AI Search
- 🎯 Professional SEO Optimization
- 📊 Detailed Access Statistics
- 💻 Priority Technical Support
- 🕒 Lifetime Access
- 🔄 Free Lifetime Updates

## 🛠️ Tech Stack

- **Frontend&Backend**: Next.js
- **Deployment**: Vercel
- **Database**: PostgreSQL

## 🗄️ Database Migrations

构建阶段不再执行 `prisma db push`，表结构变更统一走迁移：

1. 修改 `prisma/schema.prisma`
2. 生成迁移：`npx prisma migrate dev --name <change>`（会连接 `DATABASE_URL_UNPOOLED` 指向的库）
3. 提交 `prisma/migrations/`
4. 部署后按需同步：`npx prisma migrate deploy`

> 注意：本项目开发与生产共用同一 Neon 数据库，执行 `migrate dev` 前请确认目标库。

## 👥 Community

- Twitter: [@pintree_io](https://twitter.com/pintree_io)
- GitHub: [github.com/Pintree-io](https://github.com/Pintree-io)
- Discord: [Join Community](https://discord.gg/gJTrkHFg)
- Email: feedback@pintree.io

## ❤️ Contributing

We welcome Issues and Pull Requests to help improve this documentation.