# React Component Integration Note

This repository is currently a static `HTML/CSS/JS` site, so it does **not** natively support:

- shadcn project structure
- Tailwind CSS
- TypeScript React components

The requested files were still added to this folder so they are ready for a future React migration:

- [animated-shader-background.tsx](D:/job/codex/keWang_website/components/ui/animated-shader-background.tsx)
- [demo.tsx](D:/job/codex/keWang_website/components/ui/demo.tsx)
- [animated-shader-hero.tsx](D:/job/codex/keWang_website/components/ui/animated-shader-hero.tsx)
- [animated-shader-hero.demo.tsx](D:/job/codex/keWang_website/components/ui/animated-shader-hero.demo.tsx)
- [wrap-shader.tsx](D:/job/codex/keWang_website/components/ui/wrap-shader.tsx)
- [wrap-shader.demo.tsx](D:/job/codex/keWang_website/components/ui/wrap-shader.demo.tsx)
- [flow-field-background.tsx](D:/job/codex/keWang_website/components/ui/flow-field-background.tsx)
- [flow-field-background.demo.tsx](D:/job/codex/keWang_website/components/ui/flow-field-background.demo.tsx)

Why `/components/ui` matters:

- shadcn uses `/components/ui` as the predictable home for reusable UI primitives
- it keeps imports stable, for example `@/components/ui/button`
- it makes shared UI easier to maintain when the codebase grows

Current style path in this repo:

- [styles.css](D:/job/codex/keWang_website/styles.css)

If this becomes a React + Tailwind app later, the usual global style path would be one of:

- `src/index.css` for Vite React
- `app/globals.css` for Next.js App Router
- `src/app/globals.css` in some monorepo setups
