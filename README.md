# Easy Multiplication

A simple interactive multiplication learning app for kids.

## What it does

The app guides children through multiplication step by step:

1. Select the largest number.
2. Break the largest number into blocks.
3. Select the smallest number.
4. Count subtotals using finger segments.
5. Add subtotals.
6. See the final answer.

## Tech stack

- React
- Create React App
- CSS

## Getting started

### Requirements

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Start development server

```bash
npm start
```

### Build for production

```bash
npm run build
```

## Project structure

```text
src/        React components and app logic
public/     Static assets and HTML template
build/      Production build output
```

## Notes

- The project was restructured so the app now runs directly from the repository root.
- If you see lint warnings, they are non-blocking for local development and build.

## Deployment — Cloudflare Pages

The app is deployed at [kids.handytools.work/easy-multiplication](https://kids.handytools.work/easy-multiplication).

### Cloudflare Pages settings

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (repository root) |
| Node version | `18` |

### DNS (in Cloudflare dashboard)

Add a CNAME record for `kids.handytools.work` pointing to your Cloudflare Pages project domain (e.g. `kids-easy-multiplication.pages.dev`).

### How the subpath works

- `homepage` in `package.json` is set to `/easy-multiplication` so React builds all asset paths correctly.
- The `postbuild` script copies the React build into `dist/easy-multiplication/` and writes a `_redirects` file at the `dist/` root so Cloudflare Pages handles SPA deep links.
