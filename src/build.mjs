// Static site generator for Raj Chauhan's portfolio. No dependencies: `node src/build.mjs` → dist/
import fs from 'node:fs';
import path from 'node:path';
import { person, stack, ticker, experience, education, projects, services, process as steps, principles, faq } from './content.mjs';

const SRC = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.resolve(SRC, '..', 'dist');
const YEAR = 2026;
const ASSET_V = Date.now().toString(36);

// ---------- small helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ast = (cls = '') => `<svg class="ast ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 1h2.8v8.2l5.8-5.8 2 2-5.8 5.8H23v2.8h-7.6l5.8 5.8-2 2-5.8-5.8V23h-2.8v-7.8l-5.8 5.8-2-2 5.8-5.8H1v-2.8h7.6L2.8 5.6l2-2 5.8 5.8z"/></svg>`;
const arrow = `<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"/></svg>`;
const plus = `<svg class="plus" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="1.6"/></svg>`;
const star = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2 5.8 21l1.6-7L2 9.2l7.1-.6z"/></svg>`;
const icons = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11.5H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.86h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 2h3.4l-7.4 8.5L22.5 22h-6.8l-5.3-7-6.1 7H.9l7.9-9.1L.5 2h7l4.8 6.4zm-1.2 18h1.9L7.5 3.9h-2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m3.5 6 8.5 7 8.5-7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
};
const socIcon = (l) => icons[l.toLowerCase()] || '';

// a button: pale label + solid orange square arrow; orange spreads on hover
const btn = (label, href, cls = '', ext = false) =>
  `<a class="btn ${cls}" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}><span class="btn-label">${label}</span><span class="btn-sq">${arrow}</span></a>`;
const tag = (t) => `<span class="tag">${esc(t)}</span>`;
const eyebrow = (t, cls = '') => `<p class="eyebrow ${cls}">${ast()}<span>${t}</span></p>`;
// split headline: words wrapped for the blur reveal; segments in {braces} stay grey
const H = (txt, level = 'h2', cls = '') => {
  const parts = txt.split(/(\{[^}]+\})/).filter(Boolean).map((seg) => {
    const grey = seg.startsWith('{');
    return seg.replace(/[{}]/g, '').trim().split(/\s+/).map((w) => `<span class="w${grey ? ' g' : ''}"><span>${esc(w)}</span></span>`).join(' ');
  }).join(' ');
  return `<${level} class="hd ${cls}" data-split aria-label="${esc(txt.replace(/[{}]/g, ''))}">${parts}</${level}>`;
};

// ---------- media: real screenshots + generated code / UI panels ----------
const img = (file, alt, cls = '', sizes = '(max-width: 760px) 92vw, 50vw', eager = false) =>
  `<img class="${cls}" src="{R}assets/img/${file}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" sizes="${sizes}">`;

const code = (title, lines) => `<div class="panel panel-code" aria-hidden="true"><div class="pc-bar"><i></i><i></i><i></i><span>${title}</span></div><pre>${lines}</pre></div>`;
const k = (s) => `<b class="k">${s}</b>`, s_ = (s) => `<b class="s">${s}</b>`, c = (s) => `<b class="c">${s}</b>`, f = (s) => `<b class="f">${s}</b>`, n_ = (s) => `<b class="n">${s}</b>`;
const panels = {
  'code-api': () => code('routes/jobs.ts', `${k('export async function')} ${f('matchJobs')}(req, res) {
  ${k('const')} user = ${k('await')} ${f('requireAuth')}(req)
  ${k('const')} jobs = ${k('await')} db.jobs.${f('find')}({ open: ${n_('true')} })
  ${k('const')} ranked = ${k('await')} ${f('score')}(user.profile, jobs)
  ${k('return')} res.${f('json')}({ data: ranked.${f('slice')}(${n_('0')}, ${n_('20')}) })
}`),
  'code-auth': () => code('middleware/auth.ts', `${c('// every request proves who it is')}
${k('export const')} ${f('requireAuth')} = ${k('async')} (req) => {
  ${k('const')} token = req.headers.authorization?.${f('split')}(${s_("' '")})[${n_('1')}]
  ${k('if')} (!token) ${k('throw new')} ${f('HttpError')}(${n_('401')})
  ${k('return')} ${f('verify')}(token, env.JWT_SECRET)
}`),
  'code-llm': () => code('ai/score.ts', `${k('const')} res = ${k('await')} groq.chat.completions.${f('create')}({
  model: ${s_("'llama-3.3-70b'")},
  messages: [{ role: ${s_("'system'")}, content: ${f('rubric')}(role) },
             { role: ${s_("'user'")}, content: resume }],
  response_format: { type: ${s_("'json_object'")} },
})`),
  'code-ui': () => code('app/dashboard/page.tsx', `${k('export default async function')} ${f('Dashboard')}() {
  ${k('const')} matches = ${k('await')} ${f('getMatches')}()
  ${k('return')} (
    &lt;${f('Grid')}&gt;{matches.${f('map')}(m =&gt; &lt;${f('MatchCard')} {...m} /&gt;)}&lt;/${f('Grid')}&gt;
  )
}`),
  'code-lambda': () => code('handler.py', `${k('def')} ${f('handler')}(event, context):
    body = json.${f('loads')}(event[${s_('"body"')}])
    job = ${f('enqueue')}(body[${s_('"resume_url"')}])
    ${k('return')} {${s_('"statusCode"')}: ${n_('202')}, ${s_('"body"')}: job.id}`),
  'code-data': () => code('pipeline/build.py', `df = (pd.${f('read_csv')}(${s_('"plfs_2023_24.csv"')})
        .${f('merge')}(pay, on=${s_('"occupation"')})
        .${f('assign')}(share=${k('lambda')} d: d.workers / d.workers.${f('sum')}()))
df.${f('to_json')}(${s_('"site/data.json"')}, orient=${s_('"records"')})`),
  chat: () => `<div class="panel panel-chat" aria-hidden="true"><div class="ch-top"><span class="ch-dot"></span>Agent · online</div>
    <p class="bub me">Order this for dinner 🍝 <span class="ch-img"></span></p>
    <p class="bub">Found 3 places near you serving penne arrabbiata. Fastest: 28 min. Add to cart?</p>
    <p class="bub me">Yes, the fastest one</p>
    <p class="bub">Done ✓ Cart ready. Pay in the app to confirm.</p></div>`,
  pipeline: () => `<div class="panel panel-pipe" aria-hidden="true"><p class="pp-h">Hunter · today</p>
    ${[['Resume parsed', '✓'], ['Portals searched', '4'], ['Jobs scored', '38'], ['Tailored drafts', '6'], ['Applied (you confirmed)', '3']].map(([a, b], i) => `<div class="pp-row" style="--i:${i}"><span>${a}</span><b>${b}</b></div>`).join('')}
    <p class="pp-note">Illustrative numbers</p></div>`,
  terminal: () => `<div class="panel panel-term" aria-hidden="true"><pre>${'<b class="p">raj@build</b>:~/api $ git push origin main\n→ checks  ✓ lint  ✓ types  ✓ tests\n→ deploying functions\n  ✓ POST /auth/login\n  ✓ GET  /jobs/match\n  ✓ POST /ai/score\n<b class="ok">deployed · healthy</b>'}</pre></div>`,
};
const imgMedia = {
  neohire: ['neohire.webp', 'NeoHire landing page'], 'neohire-steps': ['neohire-steps.webp', 'NeoHire how-it-works steps'],
  'neohire-match': ['neohire-match.webp', 'NeoHire AI match dashboard'], 'indian-jobs': ['indian-jobs.webp', 'India Job Market Visualizer'],
  'indian-jobs-map': ['indian-jobs-map.webp', 'Treemap of Indian occupations'], 'indian-jobs-wide': ['indian-jobs-wide.webp', 'Indian Jobs treemap'],
};
const media = (key, cls = '') => imgMedia[key] ? img(imgMedia[key][0], imgMedia[key][1], cls) : panels[key]();

// ---------- shared layout ----------
const NAV = [['Home', ''], ['About', 'about/'], ['Services', 'services/'], ['Work', 'work/'], ['Contact', 'contact/']];

function header(page, inner) {
  return `<header class="site-head${inner ? ' is-inner' : ''}" data-head>
  <a class="brand" href="{R}" aria-label="${person.name}, home"><span class="brand-mark">RC</span><span class="brand-name">${person.name}<sup>®</sup></span></a>
  <nav class="head-nav" aria-label="Main">${NAV.map(([l, h]) => `<a href="{R}${h}"${page === l ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-open><span class="sr">Open menu</span><i></i><i></i></button>
</header>`;
}

function menu(page) {
  return `<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden data-menu>
  <div class="menu-inner">
    <div class="menu-top"><a class="brand" href="{R}"><span class="brand-mark">RC</span><span class="brand-name">${person.name}<sup>®</sup></span></a>
      <button class="menu-close" type="button" data-menu-close><span class="sr">Close menu</span><i></i><i></i></button></div>
    <nav class="menu-links" aria-label="Menu">${NAV.map(([l, h], i) => `<a href="{R}${h}" style="--i:${i}"${page === l ? ' aria-current="page"' : ''}><span>${l}</span>${plus}</a>`).join('')}</nav>
    <div class="menu-side">
      <p><small>Email</small><a href="mailto:${person.email}">${person.email}</a></p>
      <p><small>Status</small><span><i class="dot"></i>${person.status}</span></p>
      <p><small>Currently</small><span>Junior Developer at Apex36</span></p>
      <div class="soc">${person.social.map((s) => `<a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}">${socIcon(s.label)}</a>`).join('')}<a href="mailto:${person.email}" aria-label="Email">${icons.mail}</a></div>
    </div>
  </div>
</div>`;
}

function contactBand() {
  return `<section class="cband" aria-labelledby="cband-h">
  <div class="cband-art">${img('contact-art.webp', '', 'cband-img', '100vw')}</div>
  <div class="wrap cband-grid">
    <form class="cform" data-mailform novalidate>
      <p class="cform-brand"><span class="brand-mark">RC</span> Reach out to Raj</p>
      <label><span>Name</span><input name="name" autocomplete="name" required placeholder="Your name"></label>
      <label><span>Email</span><input name="email" type="email" autocomplete="email" required placeholder="you@company.com"></label>
      <label><span>Message</span><textarea name="message" rows="3" required placeholder="A product, a role, an idea…"></textarea></label>
      <button class="cform-send" type="submit">Send via email ${arrow}</button>
      <p class="cform-note" aria-live="polite">Opens your email app with the message ready to send.</p>
    </form>
    <div class="cband-copy">
      ${eyebrow('Let’s build', 'on-dark')}
      ${H("LET’S BUILD SOMETHING {DEPENDABLE}", 'h2', 'hd-xl on-dark')}
      <p data-reveal>Have a product to build, an API to untangle or an AI feature to ship? Tell me what you’re working on.</p>
      <a class="cband-mail" href="mailto:${person.email}" data-reveal>${person.email} ${arrow}</a>
    </div>
  </div>
</section>`;
}

function footer() {
  return `<footer class="site-foot">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-intro" data-reveal>
        <p>Full-stack developer building <strong>dependable web products, backend systems and AI integrations</strong>, from API to interface.</p>
        <p class="foot-status"><i class="dot"></i>${person.status}</p>
      </div>
      <div class="foot-mail" data-reveal>
        <small>Write to me</small>
        <a href="mailto:${person.email}">${person.email}</a>
        <button type="button" class="copy" data-copy="${person.email}">Copy email</button>
      </div>
    </div>
    <div class="foot-bottom">
      <div class="foot-cols" data-reveal>
        <div><small>Navigation</small>${NAV.map(([l, h]) => `<a href="{R}${h}">${l}</a>`).join('')}</div>
        <div><small>Elsewhere</small>${person.social.map((s) => `<a href="${s.href}" target="_blank" rel="noopener">${s.label} ${arrow}</a>`).join('')}<a href="mailto:${person.email}">Email ${arrow}</a></div>
      </div>
      <p class="foot-word" aria-hidden="true" data-footword><span>Raj</span> <span>Chauhan</span><sup>®</sup></p>
    </div>
  </div>
  <div class="foot-strip"><div class="wrap"><span>© ${YEAR} ${person.name}</span><span>Built with care, code, and curiosity</span></div></div>
</footer>`;
}

function layout({ page, title, desc, body, inner = false, root }) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#EE4004">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="{R}assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{R}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{R}assets/css/site.css?v=${ASSET_V}">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: person.name, jobTitle: person.role, email: 'mailto:' + person.email, url: person.site, sameAs: person.social.map((s) => s.href), worksFor: { '@type': 'Organization', name: 'Apex36 Technology Service LLP' }, alumniOf: education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.org })) })}</script>
</head>
<body class="page-${page.toLowerCase()}">
<a class="skip" href="#main">Skip to content</a>
${header(page, inner)}
${menu(page)}
<main id="main">
${body}
</main>
${footer()}
<script src="{R}assets/js/lenis.min.js" defer></script>
<script src="{R}assets/js/site.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
  return html.replaceAll('{R}', root);
}

// inner-page title block (orange header bar + giant title)
const pageTitle = (title, label) => `<section class="ptitle">
  <div class="wrap">
    <p class="ptitle-label">${person.name.toUpperCase()}<sup>®</sup> <span>/ ${label}</span></p>
    <h1 class="ptitle-h" data-split aria-label="${esc(title)}">${title.split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' ')}</h1>
    <p class="ptitle-meta">©${YEAR} <span>(Scroll to explore)</span></p>
  </div>
</section>`;

// ---------- reusable sections ----------
const tickerStrip = () => `<section class="strip" aria-label="Tools I ship with">
  <div class="wrap strip-in"><p class="strip-label">Tools I <br>ship with</p>
    <div class="marquee" data-marquee><div class="marquee-track">${[0, 1].map((r) => `<div class="marquee-row"${r ? ' aria-hidden="true"' : ''}>${ticker.map((t) => `<span>${ast('sm')}${t}</span>`).join('')}</div>`).join('')}</div></div>
  </div></section>`;

const proof = () => `<section class="sec proof">
  <div class="wrap">
    <div class="sec-head">${eyebrow('Why work with me')}${H('FOCUSED ON SOFTWARE {THAT HOLDS UP}')}</div>
    <div class="proof-grid">
      <div class="pcol">
        <article class="pcard" data-reveal><p class="pcard-k">${ast('sm')} Production experience</p><p class="num"><span data-count="2">0</span>+</p><p>Years shipping backend systems, serverless APIs and LLM features at Apex36.</p></article>
        <article class="pcard" data-reveal><p class="pcard-k">${ast('sm')} GitHub, last year</p><p class="num"><span data-count="${person.contributions}">0</span></p><p>Contributions across ${projects.length} public products and plenty of experiments.</p></article>
      </div>
      <article class="pcard pquote" data-reveal>
        <div class="pq-face">${img('raj-face.webp', 'Raj Chauhan', '', '96px')}</div>
        <blockquote>“${person.principle}”</blockquote>
        <p class="pq-who"><strong>${person.name}</strong><span>A principle I build by</span></p>
        <div class="pq-stack">${stack.slice(0, 6).map(tag).join('')}</div>
      </article>
      <div class="pcol">
        <figure class="pcard part" data-reveal>${img('raj-portrait-800.webp', 'Illustrated portrait of Raj Chauhan', '', '(max-width: 760px) 90vw, 30vw')}</figure>
        <article class="pcard" data-reveal><p class="pcard-k on">${ast('sm')} ${person.status}</p><p>Currently Junior Developer at Apex36. Open to roles and products where reliability matters.</p></article>
      </div>
    </div>
  </div>
</section>`;

const reel = () => `<section class="reel" aria-label="Build log">
  <div class="wrap"><div class="reel-box" data-grow>
    <div class="reel-term" data-term aria-hidden="true">
      <div class="rt-bar"><i></i><i></i><i></i><span>raj@build — zsh</span></div>
      <pre class="rt-out"></pre>
    </div>
    <p class="reel-cap"><span>${ast('sm')} From commit to production</span><span>Illustrative build log</span></p>
  </div></div>
</section>`;

const faqBlock = () => `<section class="sec faq">
  <div class="wrap faq-grid">
    <div>${eyebrow('FAQ')}${H('FREQUENT {QUESTIONS}')}<p class="faq-more" data-reveal>Something else? <a href="mailto:${person.email}">Email me</a>.</p></div>
    <div class="faq-list" data-faq>${faq.map(([q, a], i) => `<div class="faq-item${i === 0 ? ' open' : ''}">
      <h3><button type="button" aria-expanded="${i === 0}" aria-controls="faq-${i}" id="faq-q-${i}"><span class="faq-n">${String(i + 1).padStart(2, '0')}</span><span class="faq-q">${q}</span><span class="faq-pm" aria-hidden="true"></span></button></h3>
      <div class="faq-a" id="faq-${i}" role="region" aria-labelledby="faq-q-${i}"${i === 0 ? '' : ' hidden'}><p>${a}</p></div></div>`).join('')}</div>
  </div>
</section>`;

const projectCard = (p, size, i) => `<article class="wcard wcard-${size}" data-reveal style="--d:${i * 80}ms">
  <a class="wcard-media" href="${p.live || p.code}" target="_blank" rel="noopener" aria-label="${p.name}: ${p.live ? 'open live site' : 'view code on GitHub'}">${p.img ? img(size === 'lg' ? p.img : p.crop, p.alt, '', size === 'lg' ? '(max-width: 760px) 92vw, 56vw' : '(max-width: 760px) 92vw, 32vw') : panels[p.art]()}</a>
  <div class="wcard-rail"><span>${ast('sm')}<strong>${p.name}</strong></span><span>/${p.kind}</span></div>
</article>`;

// ---------- pages ----------
function home() {
  const [p1, p2, p3, p4] = projects;
  return `
<section class="hero" data-hero>
  <div class="hero-field" aria-hidden="true"><div class="hero-grid"></div>${[[33.333, 75], [83.333, 75], [66.667, 25], [16.667, 50]].map(([x, y]) => `<span class="cross" style="left:${x}%;top:${y}%"></span>`).join('')}</div>
  <p class="hero-bgname" aria-hidden="true">${person.last.toUpperCase()}</p>
  <div class="hero-portrait">${img('raj-portrait.webp', 'Illustrated portrait of Raj Chauhan', '', '(max-width: 760px) 110vw, 62vw', true)}</div>
  <div class="hero-copy">
    <p class="hero-intro">I build reliable products from API to interface: backend systems, AI integrations and the screens people use.</p>
    <div class="hero-name"><p class="hero-yr">©${YEAR} · ${person.role}</p><h1><span class="sr">${person.name}, ${person.role}</span><span aria-hidden="true">${person.first.toUpperCase()}</span></h1></div>
  </div>
  <a class="hero-proj" href="${p1.live}" target="_blank" rel="noopener">
    <span class="hp-img">${img(p1.crop, p1.alt, '', '220px', true)}</span>
    <span class="hp-rail"><span>${ast('sm')}${p1.name}</span><span>/${p1.kind}</span></span>
  </a>
  <a class="hero-talk" href="{R}contact/">
    <span class="ht-img">${img('raj-face.webp', '', '', '64px', true)}</span>
    <span class="ht-txt"><small>Let’s talk</small><strong>${person.name}</strong><em>${person.role}</em></span>
    <span class="ht-arr">${arrow}</span>
  </a>
  <p class="hero-status"><i class="dot"></i>${person.status}</p>
</section>

${tickerStrip()}

<section class="sec intro">
  <div class="wrap">
    <div class="intro-head">${eyebrow('About Raj')}${H('BUILDING PRODUCTS {FROM THE GROUND UP}', 'h2', 'hd-xl')}</div>
    ${ast('intro-ast')}
    <figure class="intro-a is-raj" data-reveal>${img('raj-portrait-800.webp', 'Illustrated portrait of Raj Chauhan', '', '(max-width: 760px) 60vw, 22vw')}</figure>
    <figure class="intro-b" data-reveal>${img('neohire-steps.webp', 'NeoHire: four steps from sign-up to getting hired', '', '(max-width: 760px) 70vw, 26vw')}</figure>
    <div class="intro-body">
      <p class="intro-lead" data-reveal>${person.bio[0]}</p>
      <div class="intro-stats">
        <div class="stat" data-reveal><p class="num"><span data-count="2">0</span>+</p><p><strong>Years in production</strong>Full-time at Apex36 since Jul 2024.</p></div>
        <div class="stat" data-reveal><p class="num"><span data-count="${projects.length}">0</span></p><p><strong>Products shipped</strong>From AI hiring to job-market data.</p></div>
      </div>
      ${btn('More about me', '{R}about/')}
    </div>
  </div>
</section>

<section class="sec svc-rows" id="services">
  <div class="wrap">
    <div class="sec-head">${eyebrow('What I build')}${H('PRODUCTS BUILT {END TO END}')}</div>
    <div class="rows">${services.map((s, i) => `<article class="row" data-reveal>
      <p class="row-n">${ast('sm')}<span>0${s.n}</span></p>
      <div class="row-main"><h3>${s.title}</h3><p>${s.text}</p><div class="tags">${s.tags.map(tag).join('')}</div></div>
      <div class="row-media slider" data-slider>${s.media.map((m, j) => `<div class="slide${j === 0 ? ' on' : ''}">${media(m)}</div>`).join('')}
        <div class="dots" role="tablist" aria-label="${s.title} images">${s.media.map((_, j) => `<button type="button" role="tab" aria-selected="${j === 0}" aria-label="Image ${j + 1}"></button>`).join('')}</div></div>
    </article>`).join('')}</div>
    <div class="center">${btn('All services', '{R}services/')}</div>
  </div>
</section>

<section class="sec work" id="work">
  <div class="wrap">
    <div class="sec-head row-head">${H('SELECTED {WORK.}', 'h2', 'hd-xl')}<p data-reveal>Products I’ve designed, built and shipped, from AI matching to a treemap of India’s job market.</p></div>
    <div class="wgrid">
      <div class="wpair">${projectCard(p1, 'lg', 0)}${projectCard(p2, 'sm', 1)}</div>
      <figure class="wwide" data-reveal>${img('indian-jobs-wide.webp', 'Indian Jobs: 211 occupations sized by employment', '', '(max-width: 760px) 92vw, 70vw')}<figcaption><span>${ast('sm')} 211 occupations · one page</span><span>/Indian Jobs</span></figcaption></figure>
      <div class="wpair rev">${projectCard(p3, 'sm', 0)}${projectCard(p4, 'lg', 1)}</div>
    </div>
    <div class="center">${btn('All projects', '{R}work/')}</div>
  </div>
</section>

<section class="sec process">
  <div class="wrap">
    <div class="sec-head center-head">${eyebrow('How I work')}${H('A PROCESS {THAT SHIPS}')}</div>
    <div class="pgrid">${steps.map((s, i) => `<article class="pstep" data-reveal style="--d:${i * 90}ms"><p class="pstep-i">${ast()}<span>0${i + 1}</span></p><h3>${s.t}</h3><p>${s.d}</p></article>`).join('')}</div>
  </div>
</section>

${proof()}
${reel()}

<section class="sec principles">
  <div class="wrap sec-head row-head">${eyebrow('Principles')}${H('WHAT I {BUILD BY}')}<p data-reveal>Not reviews: the standards I hold my own work to.</p></div>
  <div class="marquee slow" data-marquee><div class="marquee-track">${[0, 1].map((r) => `<div class="marquee-row"${r ? ' aria-hidden="true"' : ''}>${principles.map(([t, d], i) => `<article class="pr-card${i % 2 ? ' flip' : ''}"><p class="pr-top">${ast('sm')}<span>0${i + 1}</span>${plus}</p><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>`).join('')}</div></div>
</section>

<section class="sec engage">
  <div class="wrap">
    <div class="sec-head row-head">${eyebrow('Open to opportunities')}${H('LET’S WORK {TOGETHER}')}
      <div class="seg" role="tablist" aria-label="View">
        <button type="button" role="tab" aria-selected="true" data-seg="role">Hiring for a role</button>
        <button type="button" role="tab" aria-selected="false" data-seg="build">Building a product</button>
      </div></div>
    <div class="eng">
      <article class="eng-a"><p class="chip-dark">Currently</p><h3>Junior Developer</h3><p>Apex36 Technology Service LLP</p>
        <dl><div><dt>Since</dt><dd>Jul 2024</dd></div><div><dt>Type</dt><dd>Full-time</dd></div><div><dt>Status</dt><dd><i class="dot"></i> Open</dd></div></dl></article>
      <article class="eng-b">
        <div data-seg-panel="role"><p class="chip-dark">For hiring teams</p><p class="eng-big">Full stack<span>/ backend-leaning</span></p>
          <ul>${['Backend systems, REST APIs and authentication', 'Serverless on AWS Lambda and Vercel', 'LLM features with OpenAI, Claude and Groq', 'React / Next.js front ends in TypeScript', 'Python data pipelines and dashboards'].map((x) => `<li>${arrow}${x}</li>`).join('')}</ul></div>
        <div data-seg-panel="build" hidden><p class="chip-dark">For founders & teams</p><p class="eng-big">API → interface<span>/ end to end</span></p>
          <ul>${['Scope the product and its data first', 'Design the API, schema and auth', 'Build backend, frontend and AI features together', 'Deploy on serverless or Vercel', 'Improve it in small, safe steps'].map((x) => `<li>${arrow}${x}</li>`).join('')}</ul></div>
        <a class="cta-wide" href="{R}contact/"><span>Start a conversation</span>${arrow}</a>
      </article>
    </div>
  </div>
</section>

<section class="sec journey-prev">
  <div class="wrap">
    <div class="sec-head row-head">${eyebrow('Experience')}${H('WHERE I’VE {BEEN BUILDING}')}<p data-reveal>Production work at Apex36, grounded in a computer applications degree.</p></div>
    <div class="jp">
      <article class="jp-big" data-reveal><div class="jp-art">${panels['code-lambda']()}</div><div class="jp-txt"><p class="jp-meta"><span class="tag light">${experience[0].type}</span>${experience[0].from} — ${experience[0].to}</p><h3>${experience[0].role} · ${experience[0].org}</h3><p>${experience[0].text}</p></div></article>
      ${education.map((e, i) => `<article class="jp-sm" data-reveal style="--d:${(i + 1) * 90}ms"><p class="jp-badge">${i ? 'School' : 'Degree'}</p><p class="jp-meta">${e.when}</p><h3>${e.what}</h3><p>${e.org}</p></article>`).join('')}
    </div>
  </div>
</section>

${contactBand()}`;
}

function about() {
  const strip = ['raj-portrait-800.webp', 'neohire.webp', 'indian-jobs-map.webp', 'neohire-match.webp', 'indian-jobs.webp', 'neohire-steps.webp'];
  return `${pageTitle('ABOUT ME', 'About')}
<section class="gal" aria-label="Gallery"><div class="marquee gal-m" data-marquee><div class="marquee-track">${[0, 1].map((r) => `<div class="marquee-row"${r ? ' aria-hidden="true"' : ''}>${strip.map((f, i) => `<figure class="gal-i${f.startsWith('raj') ? ' is-raj' : ''}">${img(f, r ? '' : 'Raj Chauhan’s work', '', '30vw')}</figure>`).join('')}${['code-api', 'terminal'].map((p) => `<figure class="gal-i gal-p">${panels[p]()}</figure>`).join('')}</div>`).join('')}</div></div></section>

<section class="sec mission">
  <div class="wrap">
    ${eyebrow('My story')}
    ${H('RAJ BELIEVES GOOD SOFTWARE FEELS {SIMPLE ON THE SURFACE AND STAYS DEPENDABLE UNDERNEATH.}', 'h2', 'hd-xl')}
    <div class="mission-body">
      <div class="mission-copy" data-reveal>${person.bio.map((p) => `<p>${p}</p>`).join('')}</div>
      <div class="trust" data-reveal><span class="trust-face">${img('raj-face.webp', '', '', '48px')}</span><p><strong>${person.name}</strong>${person.role}</p></div>
    </div>
    <div class="metrics">
      ${[['2+', 'Years in production', 'Full-time at Apex36 since Jul 2024.'], [String(projects.length), 'Products shipped', 'NeoHire, Indian Jobs, Hunter and the Swiggy AI Agent.'], [String(stack.length), 'Core tools', 'From TypeScript and Python to AWS and OpenAI.']].map(([n, t, d]) => `<div class="metric" data-reveal><p class="outline">${n}</p><h3>${t}</h3><p>${d}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="sec dark miles">
  <div class="wrap">
    <div class="sec-head">${eyebrow('Milestones', 'on-dark')}${H('RAJ® {MILESTONES}', 'h2', 'on-dark')}</div>
    <div class="mgrid">${[
      ['Joined Apex36 as Junior Developer', 'Apex36 Technology Service LLP', 'Jul 2024', 'code'],
      ['Shipped NeoHire', 'AI hiring platform · Next.js, Node.js, Groq', '2026', 'ast'],
      ['Shipped Indian Jobs', '211 occupations visualised · Python', '2026', 'grid'],
      ['Bachelor of Computer Applications', 'K.P.B. Hinduja College of Commerce', '2024', 'cap'],
    ].map(([t, o, y, ic], i) => `<article class="mile" data-reveal style="--d:${i * 80}ms"><span class="mile-ic">${{ code: '<svg viewBox="0 0 24 24"><path d="m8 6-6 6 6 6M16 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>', ast: ast(), grid: '<svg viewBox="0 0 24 24"><path d="M3 3h8v11H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 16h8v5H3z" fill="currentColor"/></svg>', cap: '<svg viewBox="0 0 24 24"><path d="M12 4 1 9l11 5 9-4.1V16h2V9z M5 12.5V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-4.5l-7 3.2z" fill="currentColor"/></svg>' }[ic]}</span>
      <div><h3>${t}</h3><dl><div><dt>Where</dt><dd>${o}</dd></div><div><dt>Year</dt><dd>${y}</dd></div></dl></div></article>`).join('')}</div>
  </div>
</section>

<section class="sec journey">
  <div class="wrap">
    <div class="sec-head">${eyebrow('Career journey')}${H('PURPOSE-DRIVEN SOFTWARE {FOR REAL PRODUCTS}')}</div>
    <div class="jgrid">
      <figure class="jcard" data-tilt="-1"><div class="jcard-m">${img('neohire.webp', 'NeoHire, one of Raj’s products', '', '(max-width: 760px) 92vw, 44vw')}</div><figcaption><strong>APEX36_</strong> [ Jul 2024 — Present ] · Junior Developer</figcaption></figure>
      <figure class="jcard jcard-2" data-tilt="1"><div class="jcard-m"><div class="panel panel-degree" aria-hidden="true"><p class="pd-top">${ast('sm')} Bachelor of Computer Applications</p><p class="pd-big">BCA</p><p class="pd-bot"><span>K.P.B. Hinduja College of Commerce</span><span>2021 — 2024</span></p></div></div><figcaption><strong>HINDUJA_</strong> [ 2021 — 2024 ] · BCA</figcaption></figure>
    </div>
    <div class="exp-detail" data-reveal>
      <p class="tag light">${experience[0].type}</p>
      <p>${experience[0].text}</p>
      <div class="tags">${experience[0].tags.map(tag).join('')}</div>
    </div>
  </div>
</section>

<section class="sec checker">
  <div class="wrap">
    <div class="sec-head center-head">${eyebrow('Tech stack')}${H('TOOLS I {REACH FOR}')}</div>
    <div class="cgrid">${stack.map((t, i) => `<span class="cg${(Math.floor(i / 6) + i) % 2 ? ' alt' : ''}" style="--d:${i * 40}ms">${t}</span>`).join('')}</div>
  </div>
</section>

${proof()}
${reel()}
${faqBlock()}
${contactBand()}`;
}

function servicesPage() {
  return `${pageTitle('SERVICES', 'Services')}
<section class="sec svc-intro"><div class="wrap row-head">${eyebrow('What I build')}${H('FROM API {TO INTERFACE}')}<p data-reveal>Five things I do well, usually together on the same product.</p></div></section>
<section class="stack-panels">
  <div class="wrap">${services.map((s, i) => `<article class="spanel" style="--z:${i + 1}">
    <div class="sp-top"><div><p class="sp-n">${ast('sm')} ${s.n}</p><h2>${s.title.replace(' & ', ' &amp;<br>')}</h2></div>
      <div class="sp-st"><p>${s.statement}</p>${btn('Discuss a project', '{R}contact/', 'sm')}</div></div>
    <div class="sp-bot"><div class="sp-media slider" data-slider>${s.media.map((m, j) => `<div class="slide${j === 0 ? ' on' : ''}">${media(m)}</div>`).join('')}
      <div class="dots" role="tablist" aria-label="${s.title} images">${s.media.map((_, j) => `<button type="button" role="tab" aria-selected="${j === 0}" aria-label="Image ${j + 1}"></button>`).join('')}</div></div>
      <div class="sp-side"><p>${s.text}</p><div class="tags">${s.tags.map(tag).join('')}</div></div></div>
  </article>`).join('')}</div>
</section>
<section class="sec process">
  <div class="wrap">
    <div class="sec-head center-head">${eyebrow('How I work')}${H('A PROCESS {THAT SHIPS}')}</div>
    <div class="pgrid">${steps.map((s, i) => `<article class="pstep" data-reveal style="--d:${i * 90}ms"><p class="pstep-i">${ast()}<span>0${i + 1}</span></p><h3>${s.t}</h3><p>${s.d}</p></article>`).join('')}</div>
  </div>
</section>
${faqBlock()}
${contactBand()}`;
}

function work() {
  return `${pageTitle('WORK', 'Projects')}
<section class="sec wlist">
  <div class="wrap">
    <div class="wl-grid">${projects.map((p, i) => `<article class="wl" data-reveal style="--d:${(i % 2) * 90}ms" id="${p.id}">
      <h2>${p.name}</h2>
      <a class="wl-media" href="${p.live || p.code}" target="_blank" rel="noopener" aria-label="${p.name}: ${p.live ? 'open live site' : 'view code'}">${p.img ? img(p.img, p.alt, '', '(max-width: 760px) 92vw, 44vw') : panels[p.art]()}<span class="tag light">${p.kind}</span></a>
      <p class="wl-line">${p.line}</p>
      <p>${p.long}</p>
      <ul class="wl-stack">${p.stack.map(([a, b]) => `<li><strong>${a}</strong><span>${b}</span></li>`).join('')}</ul>
      <div class="wl-foot"><span>${person.name} · ${p.year}</span><span class="wl-links">${p.live ? `<a href="${p.live}" target="_blank" rel="noopener">Live site ${arrow}</a>` : ''}<a href="${p.code}" target="_blank" rel="noopener">Code ${arrow}</a></span></div>
    </article>`).join('')}</div>
    <div class="center">${btn('More on GitHub', 'https://github.com/Raj3019', '', true)}</div>
  </div>
</section>
${reel()}
${contactBand()}`;
}

function contact() {
  return `${pageTitle('CONTACT ME', 'Contact')}
<section class="sec cinfo">
  <div class="wrap cinfo-grid">
    <div>${eyebrow('Ready to start')}${H('GET IN {TOUCH}')}${btn('Email me', 'mailto:' + person.email)}</div>
    <div class="tiles">
      <div class="tile" data-reveal><small>Email</small><a href="mailto:${person.email}">${person.email}</a></div>
      <div class="tile" data-reveal><small>Status</small><p><i class="dot"></i>${person.status}</p></div>
      <div class="tile" data-reveal><small>GitHub</small><a href="${person.social[0].href}" target="_blank" rel="noopener">${person.social[0].handle}</a></div>
      <div class="tile" data-reveal><small>LinkedIn · X</small><p><a href="${person.social[1].href}" target="_blank" rel="noopener">LinkedIn</a> · <a href="${person.social[2].href}" target="_blank" rel="noopener">${person.social[2].handle}</a></p></div>
    </div>
  </div>
</section>
<section class="sec dark cform-sec">
  <div class="wrap">
    <div class="sec-head">${eyebrow('Send a message', 'on-dark')}${H('TELL ME WHAT {YOU’RE BUILDING}', 'h2', 'on-dark')}</div>
    <form class="dform" data-mailform novalidate>
      <div class="dform-row"><label><span>First name</span><input name="first" autocomplete="given-name" required></label><label><span>Last name</span><input name="last" autocomplete="family-name"></label></div>
      <label><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
      <label><span>Message</span><textarea name="message" rows="5" required placeholder="A product, a role, an API that needs untangling…"></textarea></label>
      <div class="dform-foot"><p class="cform-note" aria-live="polite">Opens your email app with the message ready to send to ${person.email}.</p><button class="dform-send" type="submit">Send message ${arrow}</button></div>
    </form>
  </div>
</section>
<section class="sec faq-card">
  <div class="wrap fc-grid">
    <div class="fc-faq">${faqBlock().replace('<section class="sec faq">', '<div class="faq">').replace(/<\/section>$/, '</div>')}</div>
  </div>
</section>
<section class="sec profile">
  <div class="wrap"><article class="prof" data-reveal>
    <div class="prof-img">${img('raj-portrait-800.webp', 'Illustrated portrait of Raj Chauhan', '', '(max-width: 760px) 80vw, 320px')}</div>
    <div class="prof-txt"><p class="eyebrow">${ast()}<span>Profile</span></p><h2>${person.name}</h2><p class="prof-role">${person.role} · Junior Developer at Apex36</p>
      <p>${person.bio[1]}</p>
      <div class="soc dark-soc">${person.social.map((s) => `<a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}">${socIcon(s.label)}</a>`).join('')}<a href="mailto:${person.email}" aria-label="Email">${icons.mail}</a></div></div>
  </article></div>
</section>`;
}

function notFound() {
  return `<section class="nf"><div class="wrap"><p class="nf-n">404</p><h1 class="hd hd-xl">THIS PAGE <span class="g">ISN’T DEPLOYED</span></h1><p>The link may be old. Everything else is up and healthy.</p>${btn('Back home', '{R}')}</div></section>`;
}

// ---------- write ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
const pages = [
  { out: 'index.html', root: './', page: 'Home', title: `${person.name}: Full Stack Developer`, desc: 'Raj Chauhan is a full-stack developer building dependable web products, backend systems and AI integrations, from API to interface.', body: home() },
  { out: 'about/index.html', root: '../', page: 'About', inner: true, title: `About · ${person.name}`, desc: 'About Raj Chauhan: full-stack developer at Apex36, BCA graduate, building backend systems, serverless APIs and LLM integrations.', body: about() },
  { out: 'services/index.html', root: '../', page: 'Services', inner: true, title: `Services · ${person.name}`, desc: 'Backend & APIs, AI & LLM integrations, full-stack web apps, serverless & cloud, and data pipelines & dashboards by Raj Chauhan.', body: servicesPage() },
  { out: 'work/index.html', root: '../', page: 'Work', inner: true, title: `Work · ${person.name}`, desc: 'Projects by Raj Chauhan: NeoHire, Indian Jobs, Hunter and the Swiggy AI Agent.', body: work() },
  { out: 'contact/index.html', root: '../', page: 'Contact', inner: true, title: `Contact · ${person.name}`, desc: `Contact Raj Chauhan, full-stack developer. Email ${person.email}.`, body: contact() },
  { out: '404.html', root: '/Raj-portfolio/', page: '404', inner: true, title: `Not found · ${person.name}`, desc: 'Page not found.', body: notFound() },
];
for (const p of pages) {
  const file = path.join(DIST, p.out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, layout(p));
}
fs.cpSync(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true, filter: (s) => !s.includes(`${path.sep}capture`) });
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log('built', pages.length, 'pages →', DIST);
