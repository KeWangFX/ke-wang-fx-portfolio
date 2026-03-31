# React + shadcn Setup Guide

This project does not currently run React, Tailwind CSS, shadcn or TypeScript components directly.

If you want to use the shader component in a real React codebase, use this setup.

## 1. Create a TypeScript React app

Example with Vite:

```bash
npm create vite@latest ke-wang-react -- --template react-ts
cd ke-wang-react
npm install
```

## 2. Install Tailwind CSS

If using the latest Tailwind-compatible React setup, add your global CSS file, usually `src/index.css`, with:

```css
@import "tailwindcss";
@import "tw-animate-css";

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

Then install the related packages:

```bash
npm install three lucide-react framer-motion @paper-design/shaders-react tw-animate-css
```

## 3. Initialize shadcn

```bash
npx shadcn@latest init
```

Keep reusable UI under:

```text
/components/ui
```

## 4. Copy in the component

Place these files in:

```text
/components/ui/animated-shader-background.tsx
/components/ui/demo.tsx
/components/ui/animated-shader-hero.tsx
/components/ui/animated-shader-hero.demo.tsx
/components/ui/wrap-shader.tsx
/components/ui/wrap-shader.demo.tsx
/components/ui/flow-field-background.tsx
/components/ui/flow-field-background.demo.tsx
```

## 5. Notes about this component

Props:

- no props are required right now

State:

- local animation state only
- no external state manager is needed

Assets:

- no images are required by this component
- `lucide-react` is imported because it was part of the provided source
- `@paper-design/shaders-react` is required for the warp shader version
- `@/lib/utils` should exist for the `cn` helper used by the flow field component

Responsive behavior:

- designed to fill the viewport
- resize handling is built into the shader renderer

Best placement:

- homepage hero
- full-screen introduction section
- behind a headline / CTA layer
