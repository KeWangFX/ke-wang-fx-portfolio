# Ke Wang 作品集网站

[English README](./README.md)

这是 Ke Wang 的静态作品集网站，重点围绕 showreel、项目片段和教程视频的直接播放来构建。

## 包含内容

- 单页电影感作品集：首页、showreel、精选项目、教程库、工作经历、简历和联系区域
- 直接使用 MP4 视频播放，不依赖 YouTube 或 Vimeo 嵌入
- 基于 `data.js` 的内容配置方式，便于持续补充项目和教程
- 简历下载和简历预览图
- 适配手机和桌面的响应式布局

## 项目结构

- `index.html`：页面结构和 SEO 元信息
- `styles.css`：视觉系统、排版、布局、动效和响应式样式
- `script.js`：页面渲染、筛选、弹窗播放器和滚动动画
- `data.js`：作品、教程、经历等可编辑内容
- `site.config.js`：站点背景图和超大视频外链映射
- `assets/videos/`：本地视频文件
- `assets/posters/`：视频封面图
- `assets/images/`：人物照片、简历预览等图片
- `assets/documents/`：可下载 PDF 文档
- `functions/`：Cloudflare Pages Functions 和访问统计接口

## 本地预览

不要直接双击 `index.html`，也不要优先用 `python -m http.server`。这两种方式对大视频拖动定位不稳定。

推荐方式：

```powershell
cd D:\job\codex\keWang_website
npm run preview
```

然后打开：

- `http://localhost:4174`

如果要查看站内 owner 统计面板，可打开：

- `http://localhost:4174/?owner=1#insights`

## 如何继续添加视频

1. 把新视频复制到 `assets/videos/`
2. 把对应封面图放到 `assets/posters/`
3. 打开 `data.js`
4. 作品片段加到 `work`，教程内容加到 `tutorialTracks`

示例：

```js
{
  id: "new-shot-id",
  title: "Project | Shot title",
  subtitle: "Short category line",
  description: "What this shot demonstrates.",
  tags: ["Water FX", "Breakdown"],
  poster: "assets/posters/new-shot.jpg",
  video: "assets/videos/new-shot.mp4",
  specs: "18s - 1080p",
  filters: ["Water FX", "Film & Episodic", "Breakdown-ready"]
}
```

## 发布与访问说明

- GitHub 仓库：`https://github.com/KeWangFX/ke-wang-fx-portfolio`
- Cloudflare Pages 线上站点：`https://ke-wang-fx-portfolio.pages.dev`
- 每次 push 到 GitHub `main`，GitHub Actions 会自动构建并发布到 Cloudflare Pages
- 中小视频直接部署到 Pages
- 超过 Pages 体积限制的大视频通过 `site.config.js` 指向 GitHub Release 资产

当前超大媒体资源发布页：

- `https://github.com/KeWangFX/ke-wang-fx-portfolio/releases/tag/media-assets-v1`

这样处理的原因：

- 避免 Cloudflare Pages 单文件约 25 MB 的上传限制
- 避免 GitHub git 对单文件 100 MB 的限制
- 保持主仓库可以正常 push、clone 和自动部署

## 中国访问说明

如果需要兼顾中国大陆访问，优先继续使用你自己的域名/CDN + 直接 MP4 或 HLS，不要把视频托管完全依赖在容易被限制的第三方平台上。这个站点当前已经避免了外部字体和第三方视频播放器依赖。

## 当前内容假设

- 目前在伦敦 DNEG 的职位来自你的项目资料和简历
- 历史项目经历和旧作品信息来自你提供的简历 PDF、视频目录和补充说明
