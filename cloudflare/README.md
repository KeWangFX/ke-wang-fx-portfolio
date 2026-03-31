# Cloudflare Setup

This site is now prepared for a Cloudflare deployment split across:

- **Cloudflare Pages** for the static website
- **Cloudflare Stream** for all video playback
- **Cloudflare R2** for resume/documents and optional background assets

## 1. Authenticate

```powershell
npx wrangler login
npx wrangler whoami
```

If you prefer a token, set `CLOUDFLARE_API_TOKEN` first.

## 2. Upload the videos to Stream

Use [media-manifest.json](./media-manifest.json) as the upload checklist.

Recommended target:

- Every file inside `assets/videos/` should live in **Cloudflare Stream**
- Use the generated Stream downloadable MP4 URL or another public playback URL in `site.config.cloudflare.js`

## 3. Upload the resume/background to R2

Suggested bucket:

```powershell
npx wrangler r2 bucket create ke-wang-site-assets
```

Example uploads:

```powershell
npx wrangler r2 object put ke-wang-site-assets/documents/ke-wang-resume.pdf --file=assets/documents/ke-wang-resume.pdf
npx wrangler r2 object put ke-wang-site-assets/backgrounds/apple-watch-myshots.jpg --file=assets/posters/apple-watch-myshots.jpg
```

Then attach a public/custom domain to the bucket in Cloudflare and place the public URLs into `site.config.cloudflare.js`.

## 4. Create the Cloudflare site config

Copy:

```powershell
Copy-Item site.config.cloudflare.example.js cloudflare\site.config.cloudflare.js
```

Then replace every placeholder URL with the real Stream / R2 URL.

## 5. Build the Pages deployment directory

This project includes huge local source videos, so **do not deploy the repo root directly to Pages**.
Instead build the slim deploy directory:

```powershell
python scripts/build_cloudflare_dist.py
```

This creates `cloudflare-dist/` and excludes `assets/videos/` from the Pages upload.

If `cloudflare/site.config.cloudflare.js` exists, it will be copied into `cloudflare-dist/site.config.js`.

## 6. Deploy to Pages

```powershell
npx wrangler pages deploy ./cloudflare-dist --project-name ke-wang-fx-portfolio
```

## Why this structure

- Pages has a **25 MB per file** upload limit, so the local MP4 tutorials and reel cannot be shipped as raw Pages assets.
- Stream solves playback, seeking, and delivery much better for the reel/tutorial library.
- R2 is a good place for documents and optional background assets with public delivery.
