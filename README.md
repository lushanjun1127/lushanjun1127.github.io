# Lushanjun1127 个人主页

这是一个现代化的、响应式的个人主页项目，采用 HTML5、CSS3 和原生 JavaScript 构建。

## 🌟 特性

- **响应式设计**：完美适配桌面、平板和手机等各种设备
- **BEM 命名规范**：采用 BEM (Block Element Modifier) CSS 命名约定，代码结构清晰
- **CSS 变量**：使用 CSS 自定义属性，便于主题定制和维护
- **无障碍访问 (A11y)**：遵循 WAI-ARIA 标准，提供良好的可访问性
- **暗色模式支持**：自动检测系统暗色模式偏好
- **SEO 优化**：包含完整的 meta 标签和结构化数据 (JSON-LD)
- **性能优化**：资源预加载、延迟加载等技术
- **打印友好**：针对打印场景优化的样式

## 📁 项目结构

```
/workspace
├── index.html          # 主 HTML 文件
├── css/
│   └── style.css       # 样式表
├── js/
│   └── main.js         # JavaScript 交互脚本
├── README.md           # 项目说明文档
├── LICENSE             # 开源许可证
└── _config.yml         # Jekyll 配置文件
```

## 🚀 快速开始

### 本地预览

直接使用浏览器打开 `index.html` 文件即可预览。

### 使用本地服务器

```bash
# 使用 Python 内置服务器
python -m http.server 8000

# 或使用 Node.js 的 http-server
npx http-server -p 8000
```

然后访问 `http://localhost:8000`

### 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支作为源
4. 访问 `https://yourusername.github.io`

## 🎨 自定义配置

### 修改主题颜色

编辑 `css/style.css` 中的 CSS 变量：

```css
:root {
    --color-primary: #6c5ce7;      /* 主色调 */
    --color-primary-light: #a29bfe; /* 浅色变体 */
    --color-bg: #f0f2f5;           /* 背景色 */
    /* ... 其他变量 */
}
```

### 更新个人信息

编辑 `index.html` 文件中的以下内容：

- 姓名和用户名
- 个人简介
- 社交媒体链接
- 邮箱地址

### 添加更多功能

可以在 `js/main.js` 中添加自定义的 JavaScript 功能。

## ♿ 无障碍特性

- 语义化 HTML 标签 (`<header>`, `<main>`, `<nav>`, `<section>`)
- ARIA 标签和角色属性
- 键盘导航支持
- 焦点可见性指示器
- 屏幕阅读器友好

## 📱 响应式断点

| 断点 | 屏幕宽度 | 布局 |
|------|---------|------|
| 桌面 | > 1024px | 左右分栏 (20% / 80%) |
| 中等屏幕 | ≤ 1024px | 左右分栏 (25% / 75%) |
| 平板 | ≤ 768px | 左右分栏 (30% / 70%) |
| 手机竖屏 | ≤ 480px | 上下堆叠 |
| 超小手机 | ≤ 360px | 紧凑布局 |

## 🔧 开发建议

### 代码规范

- HTML: 遵循语义化原则
- CSS: BEM 命名规范 + CSS 变量
- JavaScript: ES6+ 语法，严格模式

### 浏览器兼容性

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)
- 移动端浏览器

## 📄 许可证

本项目采用 [LICENSE](LICENSE) 中指定的开源许可证。

## 👤 作者

**Lushanjun1127**

- GitHub: [@lushanjun1127](https://github.com/lushanjun1127)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

⭐ 如果这个项目对你有帮助，请给一个 Star 支持！
