# Ke Wang Portfolio Website

Static portfolio site for Ke Wang, built around direct video playback for showreels, project clips and future tutorial uploads.

## What is included

- Cinematic one-page portfolio with homepage, showreel, selected work, tutorial library, experience, resume and contact sections
- Direct MP4 video playback instead of YouTube or Vimeo embeds
- Data-driven content setup in `data.js`
- Resume download and preview image
- Mobile-friendly responsive layout

## Project structure

- `index.html`: page structure and SEO metadata
- `styles.css`: visual system, layout, motion and responsive styling
- `script.js`: rendering, filters, modal player and reveal animations
- `data.js`: editable portfolio content
- `assets/videos/`: MP4 files
- `assets/posters/`: JPG poster images
- `assets/images/`: portrait and resume preview
- `assets/documents/`: downloadable resume PDF

## Local preview

Use any static server. One quick option:

```powershell
cd D:\job\codex\keWang_website
python -m http.server 4173
```

Then open `http://localhost:4173`.

## How to add more videos

1. Copy the new MP4 file into `assets/videos/`
2. Add a poster image into `assets/posters/`
3. Open `data.js`
4. Add a new object inside `work` for portfolio clips, or inside `tutorialTracks` if you want to add a tutorial lane

Example clip entry:

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

## Deployment note

If China accessibility matters, keep using direct MP4 or HLS on your own domain or CDN rather than relying on blocked third-party video embeds. This site was intentionally built without external font or video dependencies for that reason.

## Current publishing setup

- GitHub repo: `https://github.com/KeWangFX/ke-wang-fx-portfolio`
- Cloudflare Pages site: `https://ke-wang-fx-portfolio.pages.dev`
- Small and medium videos are deployed directly with Pages
- Oversized videos are served from GitHub Release assets via `site.config.js`

Current external media release:

- `https://github.com/KeWangFX/ke-wang-fx-portfolio/releases/tag/media-assets-v1`

This keeps the repository pushable while avoiding the Pages 25 MB upload limit and the GitHub 100 MB git object limit.

## Content assumptions used

- Current role at DNEG in London comes from the user brief
- Previous production credits and older experience are based on the supplied resume PDF and provided video folders
