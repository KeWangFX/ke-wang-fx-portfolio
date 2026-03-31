## Cloudflare Deployment

Current live setup:

- Cloudflare Pages project: `ke-wang-fx-portfolio`
- Production URL: `https://ke-wang-fx-portfolio.pages.dev`
- GitHub repo: `https://github.com/KeWangFX/ke-wang-fx-portfolio`
- Large media release: `https://github.com/KeWangFX/ke-wang-fx-portfolio/releases/tag/media-assets-v1`

### Why this split exists

- Cloudflare Pages has a 25 MB per-file upload limit.
- GitHub git history has a 100 MB per-file hard limit.
- Six portfolio/tutorial videos are larger than the Pages upload limit.
- Four of those are also larger than GitHub's git-object limit.

Because of that, the current deploy uses:

- Pages for the static site, functions, posters, images and smaller videos
- GitHub Release assets for the six oversized videos

### Current external media files

- `assets/videos/ke-wang-showreel-2024.mp4`
- `assets/videos/atlantic-oceanfx-v003.mp4`
- `assets/videos/atlantic-oceanfx-v005-mid.mp4`
- `assets/videos/tutorial-flip-river-waterfalls.mp4`
- `assets/videos/tutorial-prepare-collision-geometry.mp4`
- `assets/videos/tutorial-waterfalls.mp4`

These are mapped in:

- `site.config.js`
- `cloudflare/site.config.cloudflare.js` (local deploy override)

### Build and deploy

```powershell
python scripts/build_cloudflare_dist.py
npx wrangler pages deploy ./cloudflare-release --project-name ke-wang-fx-portfolio
```

### Important note about Git integration

The current Pages project was created as a direct-upload project.
Cloudflare does not allow converting a direct-upload Pages project into a source-controlled GitHub project in place.

If you want native GitHub-triggered Pages builds later, the Pages project must be recreated as a source-controlled project.
Right now the live site is working, but deploys are manual via Wrangler.
