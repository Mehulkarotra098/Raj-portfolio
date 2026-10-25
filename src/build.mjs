// Raj Chauhan — portfolio generator (v2, "Signal" design). Zero dependencies: `node src/build.mjs` → dist/
import fs from 'node:fs';
import path from 'node:path';
import { person, stack, experience, education, projects, services, process as steps, principles, faq, skillGroups } from './content.mjs';
import { icons } from './icons.mjs';

const SRC = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.resolve(SRC, '..', 'dist');
const YEAR = 2026;
const V = Date.now().toString(36);

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ast = (cls = '') => `<svg class="ast ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 1h2.8v8.2l5.8-5.8 2 2-5.8 5.8H23v2.8h-7.6l5.8 5.8-2 2-5.8-5.8V23h-2.8v-7.8l-5.8 5.8-2-2 5.8-5.8H1v-2.8h7.6L2.8 5.6l2-2 5.8 5.8z"/></svg>`;
const arrow = `<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>`;
const arrowR = `<svg class="arr-r" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h17M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
const soc = {
  GitHub: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
  LinkedIn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11.5H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.86h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4z"/></svg>',
  X: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 2h3.4l-7.4 8.5L22.5 22h-6.8l-5.3-7-6.1 7H.9l7.9-9.1L.5 2h7l4.8 6.4zm-1.2 18h1.9L7.5 3.9h-2z"/></svg>',
};
const img = (file, alt, cls = '', sizes = '(max-width: 760px) 92vw, 50vw', eager = false) =>
  `<img class="${cls}" src="{R}assets/img/${file}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" sizes="${sizes}">`;
// Heading with masked word reveal. {grey words}, [serif italic accent]
const H = (txt, tag = 'h2', cls = '') => {
  const words = txt.split(/(\{[^}]+\}|\[[^\]]+\])/).filter((s) => s.trim()).flatMap((seg) => {
    const kind = seg.startsWith('{') ? 'g' : seg.startsWith('[') ? 'it' : '';
    return seg.replace(/[{}[\]]/g, '').trim().split(/\s+/).map((w) => `<span class="m"><span class="mw${kind ? ' ' + kind : ''}">${esc(w)}</span></span>`);
  });
  return `<${tag} class="hd ${cls}" data-words aria-label="${esc(txt.replace(/[{}[\]]/g, ''))}">${words.join(' ')}</${tag}>`;
};
const label = (t, cls = '') => `<p class="label ${cls}" data-fade><span class="label-dot"></span>${t}</p>`;
const btn = (t, href, cls = '', ext = false) => `<a class="btn ${cls}" href="${href}" data-magnetic${ext ? ' target="_blank" rel="noopener"' : ''}><span class="btn-bg"></span><span class="btn-t" data-text="${esc(t)}"><span>${t}</span></span><span class="btn-i">${arrow}</span></a>`;
const tag = (t) => `<span class="tag">${esc(t)}</span>`;
const logo = (key, cls = '') => {
  const ic = icons[key];
  return ic.path ? `<svg class="logo ${cls}" viewBox="0 0 24 24" role="img" aria-label="${ic.name}"><path d="${ic.path}"/></svg>` : `<span class="logo logo-txt ${cls}" role="img" aria-label="${ic.name}">${ic.text}</span>`;
};

// generated code / UI panels (illustrations of the kind of work, not screenshots)
const kw = (s) => `<i class="k">${s}</i>`, st = (s) => `<i class="s">${s}</i>`, fn = (s) => `<i class="f">${s}</i>`, nm = (s) => `<i class="n">${s}</i>`;
const code = (file, body) => `<div class="pnl pnl-code" aria-hidden="true"><div class="pnl-bar"><b></b><b></b><b></b><span>${file}</span></div><pre>${body}</pre></div>`;
const panels = {
  api: () => code('routes/jobs.ts', `${kw('export async function')} ${fn('matchJobs')}(req, res) {
  ${kw('const')} user = ${kw('await')} ${fn('requireAuth')}(req)
  ${kw('const')} jobs = ${kw('await')} db.jobs.${fn('find')}({ open: ${nm('true')} })
  ${kw('const')} ranked = ${kw('await')} ${fn('score')}(user.profile, jobs)
  ${kw('return')} res.${fn('json')}({ data: ranked.${fn('slice')}(${nm('0')}, ${nm('20')}) })
}`),
  llm: () => code('ai/score.ts', `${kw('const')} res = ${kw('await')} groq.chat.completions.${fn('create')}({
  model: ${st("'llama-3.3-70b'")},
  messages: [
    { role: ${st("'system'")}, content: ${fn('rubric')}(role) },
    { role: ${st("'user'")}, content: resume },
  ],
  response_format: { type: ${st("'json_object'")} },
})`),
  ui: () => code('app/dashboard/page.tsx', `${kw('export default async function')} ${fn('Dashboard')}() {
  ${kw('const')} matches = ${kw('await')} ${fn('getMatches')}()
  ${kw('return')} &lt;${fn('Grid')}&gt;{matches.${fn('map')}(m =&gt;
    &lt;${fn('MatchCard')} key={m.id} {...m} /&gt;)}
  &lt;/${fn('Grid')}&gt;
}`),
  lambda: () => code('handler.py', `${kw('def')} ${fn('handler')}(event, context):
    body = json.${fn('loads')}(event[${st('"body"')}])
    job = ${fn('enqueue')}(body[${st('"resume_url"')}])
    ${kw('return')} {${st('"statusCode"')}: ${nm('202')}, ${st('"body"')}: job.id}`),
  data: () => code('pipeline/build.py', `df = (pd.${fn('read_csv')}(${st('"plfs_2023_24.csv"')})
        .${fn('merge')}(pay, on=${st('"occupation"')})
        .${fn('assign')}(share=${kw('lambda')} d: d.workers / d.workers.${fn('sum')}()))
df.${fn('to_json')}(${st('"site/data.json"')}, orient=${st('"records"')})`),
  chat: () => `<div class="pnl pnl-chat" aria-hidden="true"><p class="ch-h"><b></b>Agent · online</p>
    <p class="bub me">Order this for dinner <span class="ch-img"></span></p>
    <p class="bub">Found 3 places near you serving penne arrabbiata. Fastest: 28 min. Add to cart?</p>
    <p class="bub me">Yes, the fastest one</p>
    <p class="bub">Done ✓ Cart ready. Pay in the app to confirm.</p></div>`,
  pipeline: () => `<div class="pnl pnl-pipe" aria-hidden="true"><p class="pp-h">${ast()} Hunter · today</p>
    ${[['Resume parsed', '✓'], ['Portals searched', '4'], ['Jobs scored', '38'], ['Tailored drafts', '6'], ['Applied (you confirmed)', '3']].map(([a, b], i) => `<p class="pp-row" style="--i:${i}"><span>${a}</span><b>${b}</b></p>`).join('')}
    <p class="pp-note">Illustrative numbers</p></div>`,
};
const projMedia = (p, which = 'img') => p.img ? img(which === 'crop' ? p.crop : p.img, p.alt, '', '(max-width: 760px) 92vw, 60vw') : panels[p.art]();

// ---------- shared chrome ----------
const NAV = [['Work', 'work/'], ['About', 'about/'], ['Contact', 'contact/']];

const chrome = (page) => `
<div class="loader" data-loader aria-hidden="true">
  <div class="loader-in">
    <p class="loader-top"><span>${person.name}</span><span>Portfolio ©${YEAR}</span></p>
    <p class="loader-word"><span class="m"><span>Build</span></span> <span class="m"><span>reliable</span></span> <span class="m"><span><em>products</em></span></span></p>
    <p class="loader-bot"><span>From API to interface</span><span class="loader-n" data-loader-n>000</span></p>
    <span class="loader-bar"><i data-loader-bar></i></span>
  </div>
</div>
<div class="wipe" data-wipe aria-hidden="true"><span class="wipe-t">${person.name}</span></div>
<div class="cursor" data-cursor aria-hidden="true"><span class="cursor-dot"></span><span class="cursor-ring"><em data-cursor-label></em></span></div>
<header class="hdr" data-hdr>
  <a class="hdr-brand" href="{R}" aria-label="${person.name}, home"><span class="hdr-mark">RC</span><span class="hdr-name">${person.name}</span></a>
  <p class="hdr-role"><span class="pulse"></span>${person.status}</p>
  <nav class="hdr-nav" aria-label="Main">${NAV.map(([l, h]) => `<a href="{R}${h}"${page === l ? ' aria-current="page"' : ''}><span class="roll" data-text="${l}"><span>${l}</span></span></a>`).join('')}</nav>
  <a class="hdr-cta" href="mailto:${person.email}" data-magnetic><span class="roll" data-text="Let’s talk"><span>Let’s talk</span></span></a>
  <button class="hdr-burger" type="button" aria-expanded="false" aria-controls="menu" data-menu-open><span class="sr">Open menu</span><i></i><i></i></button>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden data-menu>
  <div class="menu-bg"></div>
  <div class="menu-in">
    <div class="menu-top"><span class="hdr-mark">RC</span><button class="menu-x" type="button" data-menu-close>Close<i></i></button></div>
    <nav class="menu-nav" aria-label="Menu">${[['Home', ''], ...NAV].map(([l, h], i) => `<a href="{R}${h}" style="--i:${i}"${page === l ? ' aria-current="page"' : ''}><sup>0${i + 1}</sup><span>${l}</span></a>`).join('')}</nav>
    <div class="menu-foot">
      <a href="mailto:${person.email}">${person.email}</a>
      <div class="menu-soc">${person.social.map((s) => `<a href="${s.href}" target="_blank" rel="noopener">${s.label}</a>`).join('')}</div>
    </div>
  </div>
</div>`;

const footer = () => `
<footer class="ftr" data-footer>
  <div class="ftr-in">
    <div class="ftr-top">
      <p class="label on-dark"><span class="label-dot"></span>Have something in mind?</p>
      <a class="ftr-big" href="mailto:${person.email}" data-cursor-text="Email">
        <span class="ftr-line"><span>Let’s build</span></span>
        <span class="ftr-line"><span>something <em>dependable</em></span></span>
      </a>
      <div class="ftr-cta">
        <a class="ftr-circle" href="mailto:${person.email}" data-magnetic aria-label="Email Raj"><span>Email me</span>${arrow}</a>
        <div class="ftr-mail"><small>Write to me</small><a href="mailto:${person.email}">${person.email}</a><button type="button" class="copy" data-copy="${person.email}">Copy email</button></div>
      </div>
    </div>
    <div class="ftr-mid">
      <div><small>Pages</small>${[['Home', ''], ...NAV].map(([l, h]) => `<a href="{R}${h}">${l}</a>`).join('')}</div>
      <div><small>Elsewhere</small>${person.social.map((s) => `<a href="${s.href}" target="_blank" rel="noopener">${s.label} ${arrow}</a>`).join('')}</div>
      <div><small>Status</small><p><span class="pulse"></span>${person.status}</p><p class="dim">Junior Developer at Apex36</p></div>
      <button class="ftr-totop" type="button" data-totop>Back to top <span>↑</span></button>
    </div>
    <p class="ftr-word" aria-hidden="true">${'RAJ CHAUHAN'.split('').map((c) => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</p>
    <div class="ftr-bot"><span>© ${YEAR} ${person.name}</span><span>Built with care, code, and curiosity</span><button type="button" class="motion-t" data-motion-toggle aria-pressed="true">Motion: on</button></div>
  </div>
</footer>`;

function layout({ page, title, desc, body, root }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0B0B0C">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://mehulkarotra098.github.io/Raj-portfolio/assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{R}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{R}assets/css/site.css?v=${V}">
<script>document.documentElement.classList.add('js');try{if(sessionStorage.getItem('rc-seen'))document.documentElement.classList.add('seen');if(localStorage.getItem('rc-motion')==='off')document.documentElement.classList.add('no-motion')}catch(e){}</script>
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: person.name, jobTitle: person.role, email: 'mailto:' + person.email, url: 'https://mehulkarotra098.github.io/Raj-portfolio/', sameAs: [person.site, ...person.social.map((s) => s.href)], worksFor: { '@type': 'Organization', name: 'Apex36 Technology Service LLP' }, alumniOf: education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.org })), knowsAbout: stack })}</script>
</head>
<body class="pg-${page.toLowerCase()}">
<a class="skip" href="#main">Skip to content</a>
${chrome(page)}
<div class="page" data-page>
<main id="main">
${body}
</main>
</div>
${footer()}
<script src="{R}assets/js/vendor/lenis.min.js" defer></script>
<script src="{R}assets/js/vendor/gsap.min.js" defer></script>
<script src="{R}assets/js/vendor/ScrollTrigger.min.js" defer></script>
<script src="{R}assets/js/site.js?v=${V}" defer></script>
</body>
</html>`.replaceAll('{R}', root);
}

// ---------- shared sections ----------
const stackSection = () => `
<section class="skills sec" id="stack">
  <div class="wrap">
    <div class="sec-hd">${label('The stack')}${H('TOOLS I [ship] WITH {EVERY DAY}')}<p class="sec-sub" data-fade>Twenty-one tools across the whole path, from the database to the deploy. Hover a tile to see it in its own colour.</p></div>
    <div class="sk-groups">${skillGroups.map((g, gi) => `
      <div class="sk-group">
        <div class="sk-gh" data-fade><span class="sk-gi">0${gi + 1}</span><h3>${g.title}</h3><p>${g.note}</p></div>
        <div class="sk-tiles" data-stagger>${g.items.map((k) => `<div class="sk" style="--brand:${icons[k].hex}" data-tilt>${logo(k)}<span>${icons[k].name}</span></div>`).join('')}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="sk-rail" aria-hidden="true">
    ${[0, 1].map((r) => `<div class="sk-row" data-rail="${r ? -1 : 1}"><div class="sk-track">${[0, 1, 2, 3].map(() => Object.keys(icons).slice(r ? 10 : 0, r ? 21 : 11).map((k) => `<span class="sk-chip" style="--brand:${icons[k].hex}">${logo(k)}${icons[k].name}</span>`).join('')).join('')}</div></div>`).join('')}
  </div>
</section>`;

const reel = () => `
<section class="reel" data-reel aria-label="Build log">
  <div class="reel-box" data-reel-box>
    <div class="reel-term" data-term aria-hidden="true">
      <div class="pnl-bar"><b></b><b></b><b></b><span>raj@build — zsh</span></div>
      <pre class="rt-out"></pre>
      <div class="reel-glow"></div>
    </div>
  </div>
  <p class="reel-cap wrap"><span>${ast()} From commit to production</span><span>Illustrative build log</span></p>
</section>`;

const faqSection = () => `
<section class="faq sec">
  <div class="wrap faq-grid">
    <div class="faq-hd">${label('FAQ')}${H('GOOD {QUESTIONS}')}<p class="sec-sub" data-fade>Anything else? <a class="ul" href="mailto:${person.email}">Email me</a>.</p></div>
    <div class="faq-list" data-faq>${faq.map(([q, a], i) => `
      <div class="faq-it${i === 0 ? ' open' : ''}" data-fade>
        <h3><button type="button" aria-expanded="${i === 0}" aria-controls="fa-${i}" id="fq-${i}"><span class="faq-n">0${i + 1}</span><span class="faq-q">${q}</span><span class="faq-pm" aria-hidden="true"></span></button></h3>
        <div class="faq-a" id="fa-${i}" role="region" aria-labelledby="fq-${i}"><div><p>${a}</p></div></div>
      </div>`).join('')}
    </div>
  </div>
</section>`;

const timeline = () => `
<section class="tl sec" data-tl>
  <div class="wrap">
    <div class="sec-hd">${label('Experience')}${H('WHERE I’VE BEEN {BUILDING}')}</div>
    <div class="tl-list">
      <span class="tl-line" aria-hidden="true"><i data-tl-fill></i></span>
      ${[
        { when: `${experience[0].from} — ${experience[0].to}`, what: experience[0].role, org: experience[0].org, text: experience[0].text, tags: experience[0].tags, now: true },
        { when: education[0].when, what: education[0].what, org: education[0].org },
        { when: education[1].when, what: education[1].what, org: education[1].org },
      ].map((e) => `
      <article class="tl-it${e.now ? ' now' : ''}" data-fade>
        <span class="tl-dot" aria-hidden="true"></span>
        <p class="tl-when">${e.when}${e.now ? ' <span class="now-pill"><span class="pulse"></span>Now</span>' : ''}</p>
        <div class="tl-body"><h3>${e.what}</h3><p class="tl-org">${e.org}</p>${e.text ? `<p class="tl-text">${e.text}</p>` : ''}${e.tags ? `<div class="tags">${e.tags.map(tag).join('')}</div>` : ''}</div>
      </article>`).join('')}
    </div>
  </div>
</section>`;

const pageHero = (title, sub, kicker) => `
<section class="ph" data-ph>
  <div class="ph-bg" aria-hidden="true"><div class="blob b1"></div><div class="blob b2"></div></div>
  <div class="wrap">
    <p class="ph-k" data-fade>${kicker}</p>
    <h1 class="ph-h" data-chars aria-label="${esc(title)}">${title.split(' ').map((w) => `<span class="ph-w">${w.split('').map((c) => `<span class="ch"><span>${c}</span></span>`).join('')}</span>`).join(' ')}</h1>
    <div class="ph-foot"><p data-fade>${sub}</p><p class="ph-scroll" data-fade><span></span>Scroll</p></div>
  </div>
</section>`;

// ---------- pages ----------
function home() {
  return `
<section class="hero" data-hero>
  <div class="hero-bg" aria-hidden="true"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="hero-grid"></div></div>
  <div class="hero-stage" data-hero-stage>
    <h1 class="hero-name" aria-label="${person.name}, ${person.role}">
      <span class="hn hn-1" aria-hidden="true">${'RAJ'.split('').map((c) => `<span class="ch"><span>${c}</span></span>`).join('')}</span>
      <span class="hn hn-2" aria-hidden="true">${'CHAUHAN'.split('').map((c) => `<span class="ch"><span>${c}</span></span>`).join('')}</span>
    </h1>
    <div class="hero-portrait" data-hero-portrait><div class="hp-in" data-mouse="14">${img('raj-portrait.webp', 'Illustrated portrait of Raj Chauhan', '', '(max-width: 760px) 100vw, 46vw', true)}</div></div>
    <div class="hero-intro" data-hero-ui>
      <p class="hi-role">${ast()}${person.role}</p>
      <p class="hi-text">I build reliable products from <em>API</em> to <em>interface</em>: backend systems, AI integrations and the screens people use.</p>
    </div>
    <a class="hero-card hc-proj" href="${projects[0].live}" target="_blank" rel="noopener" data-hero-ui data-cursor-text="Visit"><span class="hc-in" data-mouse="-22">
      <span class="hc-img">${img(projects[0].crop, projects[0].alt, '', '240px', true)}</span>
      <span class="hc-meta"><span>${ast()} ${projects[0].name}</span><span>Live ↗</span></span></span>
    </a>
    <a class="hero-card hc-talk" href="{R}contact/" data-hero-ui><span class="hc-in" data-mouse="-12">
      <span class="hc-face">${img('raj-face.webp', '', '', '60px', true)}</span>
      <span class="hc-t"><small><span class="pulse"></span>${person.status}</small><strong>Let’s talk</strong></span>
      <span class="hc-arr">${arrow}</span></span>
    </a>
    <div class="hero-bottom" data-hero-ui>
      <p class="hb-scroll"><span class="hb-line"></span>Scroll to explore</p>
      <p class="hb-yr">©${YEAR} — Portfolio</p>
    </div>
  </div>
</section>

<section class="band" aria-label="What I do">
  <div class="band-row" data-band="1"><div class="band-track">${[0, 1, 2].map(() => ['Backend systems', 'AI integrations', 'Serverless APIs', 'Data pipelines', 'Full-stack apps'].map((t) => `<span>${t}</span>${ast()}`).join('')).join('')}</div></div>
</section>

<section class="mani sec" data-mani>
  <div class="wrap">
    ${label('About Raj')}
    <p class="mani-text" data-fill>I’m a full-stack developer who builds products from the ground up <span class="mani-pill p1" aria-hidden="true">${img('raj-face.webp', '', '', '90px')}</span> designing an API, wiring up authentication, deploying a service or polishing the frontend <span class="mani-pill p2" aria-hidden="true">{ }</span> I care about code that holds up in production and interfaces that don’t make people work harder than they need to.</p>
    <div class="stats">
      ${[[2, '+', 'Years in production', 'Full-time at Apex36 since Jul 2024'], [projects.length, '', 'Products shipped', 'NeoHire, Indian Jobs, Hunter, Swiggy agent'], [person.contributions, '', 'GitHub contributions', 'In the last year'], [211, '', 'Occupations visualised', 'In Indian Jobs, on one page']].map(([n, s, t, d]) => `
      <div class="stat" data-fade><p class="stat-n"><span data-count="${n}">0</span>${s}</p><p class="stat-t">${t}</p><p class="stat-d">${d}</p></div>`).join('')}
    </div>
    <div class="mani-cta" data-fade>${btn('More about me', '{R}about/')}</div>
  </div>
</section>

<section class="work" id="work" data-work>
  <div class="work-hd wrap">
    <div>${label('Selected work')}${H('THINGS I’VE [built] {AND SHIPPED}')}</div>
    <p class="work-count" aria-hidden="true"><span data-work-i>01</span><span class="dim"> / 0${projects.length}</span></p>
  </div>
  <div class="work-pin" data-work-pin>
    <div class="work-track" data-work-track>
      ${projects.map((p, i) => `
      <article class="wk" data-wk>
        <a class="wk-media" href="${p.live || p.code}" target="_blank" rel="noopener" data-cursor-text="${p.live ? 'Visit' : 'Code'}" aria-label="${p.name}: ${p.live ? 'open the live site' : 'view the code'}">
          <span class="wk-media-in" data-wk-par>${projMedia(p)}</span>
          <span class="wk-kind">${p.kind}</span>
        </a>
        <div class="wk-info">
          <p class="wk-n">0${i + 1}</p>
          <div class="wk-txt"><h3>${p.name}</h3><p class="wk-line">${p.line}</p></div>
          <ul class="wk-stack">${p.stack.map(([a]) => `<li>${a}</li>`).join('')}</ul>
        </div>
      </article>`).join('')}
      <a class="wk wk-more" href="{R}work/" data-cursor-text="Open">
        <span class="wk-more-in"><span class="wk-more-k">${ast()} All projects</span><span class="wk-more-t">Every project, <em>in detail</em></span><span class="wk-more-a">${arrowR}</span></span>
      </a>
    </div>
    <div class="work-prog" aria-hidden="true"><i data-work-bar></i></div>
  </div>
</section>

<section class="caps sec" id="services">
  <div class="wrap">
    <div class="sec-hd">${label('What I do')}${H('FROM API {TO INTERFACE}')}<p class="sec-sub" data-fade>Five things I do well, usually together on the same product.</p></div>
  </div>
  <div class="caps-stack wrap">
    ${services.map((s, i) => `
    <article class="cap" data-cap>
      <div class="cap-in">
        <div class="cap-l">
          <p class="cap-n">${s.n}<span>/0${services.length}</span></p>
          <h3>${s.title}</h3>
          <p class="cap-st">${s.statement}</p>
          <div class="tags">${s.tags.map(tag).join('')}</div>
        </div>
        <div class="cap-r">${[panels.api, panels.llm, panels.ui, panels.lambda, panels.data][i]()}</div>
      </div>
    </article>`).join('')}
  </div>
</section>

${stackSection()}

<section class="proc sec" data-proc>
  <div class="wrap">
    <div class="sec-hd">${label('How I work')}${H('A PROCESS {THAT SHIPS}')}</div>
    <div class="proc-row">
      <span class="proc-line" aria-hidden="true"><i data-proc-fill></i></span>
      ${steps.map((s, i) => `<article class="pstep" data-pstep><span class="pstep-dot">0${i + 1}</span><h3>${s.t}</h3><p>${s.d}</p></article>`).join('')}
    </div>
  </div>
</section>

${reel()}
${timeline()}

<section class="quote sec">
  <div class="wrap quote-in">
    <figure class="quote-img" data-reveal-media><span data-par="12">${img('raj-portrait-800.webp', 'Illustrated portrait of Raj Chauhan', '', '(max-width: 760px) 70vw, 30vw')}</span></figure>
    <blockquote>
      <p class="quote-t" data-fill>“Good software should feel simple on the surface and stay dependable underneath.”</p>
      <footer data-fade><strong>${person.name}</strong> · A principle I build by</footer>
    </blockquote>
  </div>
</section>`;
}

function about() {
  return `
${pageHero('ABOUT RAJ', 'Full-stack developer at Apex36. I build backend systems, serverless APIs and practical LLM features, and the interfaces that sit on top.', `${ast()} About`)}
<section class="ab sec">
  <div class="wrap ab-grid">
    <figure class="ab-photo" data-tilt data-reveal-media>${img('raj-portrait.webp', 'Illustrated portrait of Raj Chauhan', '', '(max-width: 760px) 92vw, 40vw')}<figcaption><span class="pulse"></span>${person.status}</figcaption></figure>
    <div class="ab-copy">
      ${label('My story')}
      ${person.bio.map((p) => `<p class="ab-p" data-fill>${p}</p>`).join('')}
      <div class="ab-facts" data-stagger>
        ${[['Role', 'Junior Developer'], ['Company', 'Apex36 Technology Service LLP'], ['Since', 'Jul 2024'], ['Degree', 'BCA, 2021 — 2024'], ['Focus', 'Backend · AI · Serverless'], ['Status', person.status]].map(([a, b]) => `<p><small>${a}</small><span>${b}</span></p>`).join('')}
      </div>
    </div>
  </div>
</section>
<section class="band band-dark" aria-hidden="true">
  <div class="band-row" data-band="-1"><div class="band-track">${[0, 1, 2].map(() => principles.map(([t]) => `<span>${t}</span>${ast()}`).join('')).join('')}</div></div>
</section>
<section class="prin sec">
  <div class="wrap">
    <div class="sec-hd">${label('Principles')}${H('WHAT I [build] {BY}')}</div>
    <div class="prin-grid" data-stagger>${principles.map(([t, d], i) => `<article class="prin-c" data-tilt><p class="prin-n">0${i + 1}</p><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
  </div>
</section>
${timeline()}
${stackSection()}
${reel()}
${faqSection()}`;
}

function work() {
  return `
${pageHero('WORK', 'Products I’ve designed, built and shipped: AI matching, a treemap of India’s job market, job automation and a conversational ordering agent.', `${ast()} Projects · 0${projects.length}`)}
<section class="wl sec">
  <div class="wrap">
    <div class="wl-index">
      ${projects.map((p, i) => `
      <a class="wl-row" href="#${p.id}" data-preview="${p.img ? `{R}assets/img/${p.img}` : ''}" data-fade>
        <span class="wl-n">0${i + 1}</span><span class="wl-name">${p.name}</span><span class="wl-kind">${p.kind}</span><span class="wl-year">${p.year}</span><span class="wl-go">${arrow}</span>
      </a>`).join('')}
    </div>
  </div>
  <div class="wl-float" data-preview-float aria-hidden="true"><img alt="" decoding="async"></div>
</section>
${projects.map((p, i) => `
<section class="cs" id="${p.id}">
  <div class="wrap">
    <div class="cs-hd">
      <p class="cs-n" data-fade>0${i + 1} — ${p.kind}</p>
      ${H(p.name.toUpperCase(), 'h2', 'cs-h')}
    </div>
    <a class="cs-media" href="${p.live || p.code}" target="_blank" rel="noopener" data-cursor-text="${p.live ? 'Visit' : 'Code'}" data-reveal-media aria-label="${p.name}: ${p.live ? 'open the live site' : 'view the code'}">
      <span class="cs-media-in" data-par="10">${projMedia(p)}</span>
    </a>
    <div class="cs-body">
      <p class="cs-line" data-fade>${p.line}</p>
      <div class="cs-text">
        <p data-fade>${p.long}</p>
        <ul class="cs-stack" data-stagger>${p.stack.map(([a, b]) => `<li><strong>${a}</strong><span>${b}</span></li>`).join('')}</ul>
        <div class="cs-links" data-fade>${p.live ? btn('Live site', p.live, '', true) : ''}${btn('View code', p.code, p.live ? 'ghost' : '', true)}</div>
      </div>
    </div>
  </div>
</section>`).join('')}
<section class="sec more-gh"><div class="wrap more-in">${H('MORE ON [GitHub]', 'h2')}${btn('github.com/Raj3019', 'https://github.com/Raj3019', '', true)}</div></section>`;
}

function contact() {
  return `
${pageHero('SAY HELLO', 'Building a product, hiring for a role or untangling an API? Tell me about it. I reply by email.', `${ast()} Contact`)}
<section class="ct sec">
  <div class="wrap ct-grid">
    <form class="ct-form" data-mailform novalidate>
      ${label('Send a message')}
      <div class="fld-row">
        <label class="fld" data-fade><input name="name" autocomplete="name" required placeholder=" "><span>Your name</span></label>
        <label class="fld" data-fade><input name="email" type="email" autocomplete="email" required placeholder=" "><span>Email</span></label>
      </div>
      <fieldset class="chips" data-fade><legend>I’m reaching out about</legend>
        ${['A full-time role', 'A product to build', 'An AI feature', 'Something else'].map((c, i) => `<label><input type="radio" name="topic" value="${c}"${i === 0 ? ' checked' : ''}><span>${c}</span></label>`).join('')}
      </fieldset>
      <label class="fld fld-ta" data-fade><textarea name="message" rows="4" required placeholder=" "></textarea><span>Your message</span></label>
      <div class="ct-send" data-fade><button class="btn" type="submit" data-magnetic><span class="btn-bg"></span><span class="btn-t" data-text="Send via email"><span>Send via email</span></span><span class="btn-i">${arrow}</span></button><p class="form-note" aria-live="polite">Opens your email app with everything filled in.</p></div>
    </form>
    <aside class="ct-side">
      <div class="ct-card" data-fade><small>Email</small><a href="mailto:${person.email}">${person.email}</a><button type="button" class="copy" data-copy="${person.email}">Copy email</button></div>
      <div class="ct-card" data-fade><small>Status</small><p><span class="pulse"></span>${person.status}</p><p class="dim">Junior Developer at Apex36</p></div>
      <div class="ct-card ct-soc" data-fade><small>Elsewhere</small>${person.social.map((s) => `<a href="${s.href}" target="_blank" rel="noopener">${soc[s.label]}<span>${s.label}</span><em>${s.handle}</em>${arrow}</a>`).join('')}</div>
    </aside>
  </div>
</section>
${faqSection()}`;
}

function notFound() {
  return `<section class="nf"><div class="wrap"><p class="nf-n">404</p>${H('THIS ROUTE ISN’T [deployed]', 'h1')}<p class="sec-sub">The link may be old. Everything else is up and healthy.</p>${btn('Back home', '{R}')}</div></section>`;
}

// ---------- write ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
const pages = [
  { out: 'index.html', root: './', page: 'Home', title: `${person.name} — Full Stack Developer`, desc: 'Raj Chauhan is a full-stack developer building dependable web products, backend systems and AI integrations, from API to interface.', body: home() },
  { out: 'about/index.html', root: '../', page: 'About', title: `About — ${person.name}`, desc: 'About Raj Chauhan: full-stack developer at Apex36 building backend systems, serverless APIs and LLM integrations.', body: about() },
  { out: 'work/index.html', root: '../', page: 'Work', title: `Work — ${person.name}`, desc: 'Projects by Raj Chauhan: NeoHire, Indian Jobs, Hunter and the Swiggy AI Agent.', body: work() },
  { out: 'contact/index.html', root: '../', page: 'Contact', title: `Contact — ${person.name}`, desc: `Contact Raj Chauhan, full-stack developer: ${person.email}.`, body: contact() },
  { out: '404.html', root: '/Raj-portfolio/', page: '404', title: `Not found — ${person.name}`, desc: 'Page not found.', body: notFound() },
];
for (const p of pages) {
  const f = path.join(DIST, p.out);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, layout(p));
}
// the old /services/ page now lives on the home page
fs.mkdirSync(path.join(DIST, 'services'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'services/index.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../#services"><title>Services — Raj Chauhan</title><a href="../#services">Services</a>');
fs.cpSync(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true, filter: (s) => !s.includes(`${path.sep}capture`) });
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log('built', pages.length, 'pages');
