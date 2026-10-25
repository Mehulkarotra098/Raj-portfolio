# Raj Chauhan — portfolio

Personal site for **Raj Chauhan**, full-stack developer. Live on GitHub Pages:
**https://mehulkarotra098.github.io/Raj-portfolio/**

Five pages (Home, About, Services, Work, Contact) in an editorial orange system: oversized grotesk type,
an illustrated portrait layered between a background and foreground name, sticky overlapping service
panels, a growing terminal "build log", tickers, counters and blur-to-sharp headline reveals.

## How it works
- `src/content.mjs` — every fact on the site (bio, projects, stack, experience, FAQ). Edit here.
- `src/build.mjs` — zero-dependency generator: `node src/build.mjs` writes the site to `dist/`.
- `src/assets/` — CSS, JS (Lenis smooth scroll + interactions) and images.
- `.github/workflows/pages.yml` — builds and deploys to GitHub Pages on every push to `main`.
- `.github/workflows/capture.yml` — run manually to refresh live screenshots of NeoHire and Indian Jobs.

## Local preview
```bash
node src/build.mjs
npx serve dist      # then open the printed URL
```

Contact forms have no backend: they open the visitor's email app with the message addressed to Raj.
Motion respects `prefers-reduced-motion`.
