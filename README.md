# projects-library

A scroll-animated portfolio built with React, TypeScript, and Vite.

Scroll through a subgrid photo wall of projects that transitions from a full-viewport hero image down to a 5×3 grid of project cards. Each card links to its GitHub repository. The animation is driven entirely by CSS scroll-driven animations (`animation-timeline`, `view-timeline`, `animation-range`), with GSAP ScrollTrigger as a fallback for browsers that don't yet support the spec.

## Stack

- React 19 + TypeScript
- Vite
- CSS scroll-driven animations + subgrid
- GSAP ScrollTrigger (fallback only)

## Dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
