# Raj Chauhan — portfolio

Personal site for **Raj Chauhan**, full-stack developer. Live on GitHub Pages:
**https://mehulkarotra098.github.io/Raj-portfolio/**

Four pages (Home, About, Work, Contact) in the "Signal" design: orange on ink and paper, heavy grotesk +
serif accents, and motion everywhere — preloader, page-transition wipe, pinned hero the page slides over,
horizontal project gallery, stacking capability cards, scroll-filled text, velocity marquees, logo skill
tiles, drawing timelines, a growing terminal build log, custom cursor, magnetic buttons and a curtain footer.
Motion is GSAP + ScrollTrigger + Lenis (vendored in `src/assets/js/vendor`); logos are Simple Icons (CC0).

## How it works
- `src/content.mjs` — every fact on the site (bio, projects, stack, experience, FAQ). Edit here.
- `src/build.mjs` — zero-dependency generator: `node src/build.mjs` writes the site to `dist/`.
- `src/icons.mjs` — brand logo paths for the skills section.
- `src/assets/` — CSS, JS (motion + interactions) and images.
- `.github/workflows/pages.yml` — builds and deploys to GitHub Pages on every push to `main`.
- `.github/workflows/capture.yml` — run manually to refresh live screenshots of NeoHire and Indian Jobs.

## Local preview
```bash
node src/build.mjs
npx serve dist      # then open the printed URL
```

Contact forms have no backend: they open the visitor's email app with the message addressed to Raj.
Motion respects `prefers-reduced-motion`.
