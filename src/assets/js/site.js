// Raj Chauhan — motion + interaction layer (GSAP + ScrollTrigger + Lenis).
// Every animation has a resting state that is fully readable; reduced-motion users get that state directly.
(() => {
  const html = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // Motion is on by default (it is the point of this site); visitors can switch it off in the footer.
  let pref = null; try { pref = localStorage.getItem('rc-motion'); } catch (e) { /* storage blocked */ }
  const reduce = pref === 'off';
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const motion = !reduce && G && ST;
  const desktop = () => innerWidth > 860;
  if (!motion) html.classList.add('no-motion');

  // ---------- smooth scroll ----------
  let lenis = null;
  if (motion) {
    G.registerPlugin(ST);
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.35, wheelMultiplier: 0.9, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.4 });
      lenis.on('scroll', ST.update);
      G.ticker.add((t) => lenis.raf(t * 1000));
      G.ticker.lagSmoothing(0);
    }
    G.defaults({ ease: 'expo.out', duration: 1.2 });
  }
  const scrollTo = (target, opts = {}) => lenis ? lenis.scrollTo(target, { offset: -70, duration: 1.4, ...opts }) : (typeof target === 'number' ? window.scrollTo({ top: target, behavior: 'smooth' }) : $(target)?.scrollIntoView({ behavior: 'smooth' }));

  // ---------- loader (first visit) / wipe (later pages) ----------
  const loader = $('[data-loader]');
  const wipe = $('[data-wipe]');
  const seen = html.classList.contains('seen');
  try { sessionStorage.setItem('rc-seen', '1'); } catch (e) { /* private mode */ }

  // First visit: a request travels API → Data → AI → UI while the counter runs, the headline
  // re-renders at each stage, and the UI node bursts into the orange page underneath.
  function runLoader() {
    const n = $('[data-loader-n]'), fill = $('[data-ld-fill]'), packet = $('[data-ld-packet]');
    const nodes = $$('[data-ld-node]'), word = $('[data-ld-word]'), burst = $('[data-ld-burst]');
    const words = ['API', 'Data', 'AI', 'Interface'];
    const GLYPHS = '01{}[]<>/=_$#*+';
    let stage = 0, scr = null;
    const fit = () => { // keep the longest word inside its column
      word.style.fontSize = '';
      const max = word.closest('.ld-head').clientWidth; const w = word.scrollWidth;
      if (w > max) word.style.fontSize = (parseFloat(getComputedStyle(word).fontSize) * max / w * 0.98) + 'px';
    };
    const render = (target) => { // scramble from the current word to the next
      scr?.kill();
      const o = { p: 0 }, from = word.textContent;
      const len = Math.max(from.length, target.length);
      scr = G.to(o, { p: 1, duration: 0.42, ease: 'power2.out', onUpdate: () => {
        const done = Math.floor(o.p * target.length);
        let out = target.slice(0, done);
        for (let i = done; i < Math.round(len + (target.length - len) * o.p); i++) out += `<span class="sc">${GLYPHS[(Math.random() * GLYPHS.length) | 0]}</span>`;
        word.innerHTML = out;
      }, onComplete: () => { word.textContent = target; } });
    };
    word.textContent = words[words.length - 1]; fit(); word.textContent = words[0];
    nodes[0].classList.add('on');
    const c = { v: 0 };
    const tl = G.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.ld-grid', { opacity: 1, duration: 1.2 }, 0)
      .to(['.ld-top > *', '.ld-bot'], { opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power2.out' }, 0.05)
      .to('.ld-term', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.1)
      .to($$('.ld-l'), { opacity: 1, y: 0, duration: 0.5, stagger: 0.17 }, 0.2)
      .to('.ld-kick', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.25)
      .to(word, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'expo.inOut' }, 0.2)
      .to('.ld-sub .m > span', { y: 0, duration: 1, stagger: 0.12 }, 0.55)
      .to(c, { v: 100, duration: 2.5, ease: 'power2.inOut', onUpdate: () => {
        const v = c.v;
        n.textContent = String(Math.round(v)).padStart(3, '0');
        fill.style.transform = `scaleX(${v / 100})`;
        packet.style.left = v + '%';
        const s = v >= 99.5 ? 3 : v >= 66.6 ? 2 : v >= 33.3 ? 1 : 0;
        if (s > stage) { for (let i = stage + 1; i <= s; i++) nodes[i].classList.add('on'); stage = s; render(words[s]); }
      } }, 0.25)
      // the UI node opens into the orange page
      .add(() => {
        const r = nodes[3].querySelector('i').getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
        G.fromTo(burst, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 1.05, ease: 'expo.inOut' });
      }, 3.0)
      .to('.ld-in', { opacity: 0, scale: 0.97, duration: 0.6, ease: 'power2.in' }, 3.15)
      .add(() => { intro(); lenis?.start(); }, 3.75)
      .to(loader, { opacity: 0, duration: 0.55, ease: 'power1.out' }, 3.8)
      .set(loader, { display: 'none' });
  }

  // ---------- page transition: two curtains (ink, then orange) carrying the name ----------
  const wipeLayers = () => [$('[data-wipe-dk]'), $('[data-wipe-or]')];
  const wipeChars = () => $$('.wipe-t .wc > span');
  function wipeOut(label, done) {
    const [dk, or] = wipeLayers(), to = $('[data-wipe-to]'), n = $('[data-wipe-n]');
    if (to) to.textContent = label;
    try { sessionStorage.setItem('rc-to', label); } catch (e) { /* storage blocked */ }
    const c = { v: 0 };
    const tl = G.timeline({ onComplete: done });
    tl.fromTo(dk, { yPercent: 101 }, { yPercent: 0, duration: 0.65, ease: 'expo.inOut' }, 0)
      .fromTo(or, { yPercent: 101 }, { yPercent: 0, duration: 0.65, ease: 'expo.inOut' }, 0.08)
      .fromTo(wipeChars(), { yPercent: 115, rotateX: -70, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, duration: 0.7, stagger: 0.03, ease: 'expo.out' }, 0.32)
      .fromTo('.wipe-top, .wipe-to', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.4)
      .fromTo('[data-wipe-bar]', { scaleX: 0 }, { scaleX: 1, duration: 0.65, ease: 'power2.inOut' }, 0.3)
      .to(c, { v: 99, duration: 0.65, ease: 'power2.inOut', onUpdate: () => { if (n) n.textContent = String(Math.round(c.v)).padStart(2, '0'); } }, 0.3)
      .to(wipeChars(), { yPercent: -8, duration: 0.25, stagger: { each: 0.02, yoyo: true, repeat: 1 }, ease: 'sine.inOut' }, 0.85);
  }
  function wipeIn() {
    const [dk, or] = wipeLayers(), to = $('[data-wipe-to]'), n = $('[data-wipe-n]');
    try { const l = sessionStorage.getItem('rc-to'); if (l && to) to.textContent = l; } catch (e) { /* storage blocked */ }
    if (n) n.textContent = '100';
    G.set([dk, or], { yPercent: 0 }); G.set('[data-wipe-bar]', { scaleX: 1 });
    G.timeline()
      .to(wipeChars(), { yPercent: -115, rotateX: 70, opacity: 0, duration: 0.55, stagger: 0.025, ease: 'expo.in' }, 0.05)
      .to('.wipe-top, .wipe-to', { opacity: 0, y: -10, duration: 0.35, ease: 'power2.in' }, 0.1)
      .to(or, { yPercent: -101, duration: 0.95, ease: 'expo.inOut' }, 0.35)
      .to(dk, { yPercent: -101, duration: 0.95, ease: 'expo.inOut' }, 0.47)
      .add(intro, 0.75);
  }

  function enter() {
    if (!motion) { document.body.classList.add('is-in'); return; }
    if (!seen && loader) {
      lenis?.stop();
      runLoader();

    } else if (wipe) wipeIn();
    else intro();
  }

  // page-leave wipe for internal links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || !motion || !wipe) return;
    const url = new URL(a.href, location.href);
    if (a.target === '_blank' || a.hasAttribute('download') || url.origin !== location.origin || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (url.pathname === location.pathname && url.hash) return; // in-page anchor
    if (url.protocol === 'mailto:') return;
    e.preventDefault();
    closeMenu(true);
    const label = (a.textContent || '').trim().replace(/\s+/g, ' ').split(' ').slice(0, 2).join(' ') || 'page';
    wipeOut(label, () => { location.href = url.href; });
  });
  addEventListener('pageshow', (e) => { if (e.persisted && wipe && motion) G.set(wipeLayers(), { yPercent: -101 }); });

  // ---------- intro (hero) ----------
  function intro() {
    document.body.classList.add('is-in');
    if (!motion) return;
    const hero = $('[data-hero]');
    if (hero) {
      // like the reference: the orange field settles first, the name sharpens out of a blur,
      // then the portrait and cards arrive in stages
      const tl = G.timeline({ defaults: { ease: 'power3.out' } });
      tl.to($$('.hero-bg .blob', hero), { opacity: (i) => (i === 2 ? 0.35 : 0.7), duration: 1.6, stagger: 0.15 }, 0)
        .to('.hero-grid', { opacity: 1, duration: 1.4 }, 0.1)
        .fromTo($$('.hn-1 .ch > span', hero), { opacity: 0, filter: 'blur(26px)', y: 30, scale: 1.08 }, { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1, duration: 1.5, stagger: 0.09 }, 0.35)
        .set('[data-hero-portrait]', { opacity: 1 }, 0.7)
        .fromTo('[data-hp-reveal]', { clipPath: 'inset(100% -20% -20% -20%)', y: 90 }, { clipPath: 'inset(-20% -20% -20% -20%)', y: 0, duration: 1.7, ease: 'expo.out' }, 0.6)
        .fromTo($$('.hn-2 .ch > span', hero), { opacity: 0, filter: 'blur(20px)', y: 20 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.3, stagger: 0.06 }, 1.0)
        .fromTo('[data-hero-ui]', { opacity: 0, y: 34, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.12 }, 1.2)
        .add(() => {
          // portrait keeps breathing so the hero never sits still
          G.set('[data-hp-reveal]', { clipPath: 'none' });
          G.to('[data-hp-breathe]', { y: -10, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          G.set([...$$('.hn .ch > span', hero), ...$$('[data-hero-ui]', hero)], { filter: 'none' });
        });
    }
    const ph = $('[data-ph]');
    if (ph) G.fromTo($$('.ph-h .ch > span', ph), { y: '110%', rotateX: -90, transformPerspective: 800, transformOrigin: '50% 100%' }, { y: 0, rotateX: 0, duration: 1.5, stagger: 0.045, ease: 'expo.out', delay: 0.05 });
  }

  // ---------- header: solid after hero, hides on scroll down ----------
  const hdr = $('[data-hdr]');
  let lastY = 0, menuOpen = false;
  const onScroll = (y) => {
    const first = $('[data-hero], [data-ph]');
    const limit = first ? first.offsetHeight - 80 : 40;
    hdr.classList.toggle('is-solid', y > limit);
    if (!menuOpen) hdr.classList.toggle('is-hidden', y > lastY && y > 300 && Math.abs(y - lastY) > 2);
    if (y < lastY - 2) hdr.classList.remove('is-hidden');
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  // ---------- menu ----------
  const menu = $('[data-menu]');
  let lastFocus = null;
  function openMenu() {
    menuOpen = true; lastFocus = document.activeElement;
    menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open'));
    $('[data-menu-open]').setAttribute('aria-expanded', 'true');
    lenis?.stop(); document.body.style.overflow = 'hidden';
    setTimeout(() => $('[data-menu-close]').focus(), 80);
  }
  function closeMenu(instant) {
    if (!menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    $('[data-menu-open]').setAttribute('aria-expanded', 'false');
    lenis?.start(); document.body.style.overflow = '';
    setTimeout(() => { menu.hidden = true; }, instant ? 0 : 800);
    if (!instant) lastFocus?.focus();
  }
  $('[data-menu-open]')?.addEventListener('click', openMenu);
  $('[data-menu-close]')?.addEventListener('click', () => closeMenu());
  menu?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab') {
      const f = $$('a, button', menu), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---------- in-page anchors + back to top ----------
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1 && $(id)) { e.preventDefault(); scrollTo(id); }
  }));
  $('[data-totop]')?.addEventListener('click', () => scrollTo(0, { offset: 0, duration: 2 }));
  $$('[data-motion-toggle]').forEach((b) => {
    b.textContent = reduce ? 'Motion: off' : 'Motion: on';
    b.setAttribute('aria-pressed', String(!reduce));
    b.addEventListener('click', () => { try { localStorage.setItem('rc-motion', reduce ? 'on' : 'off'); } catch (e) { /* ignore */ } location.reload(); });
  });

  // ---------- FAQ ----------
  $$('[data-faq]').forEach((list) => {
    const items = $$('.faq-it', list);
    items.forEach((it) => $('button', it).addEventListener('click', () => {
      const open = !it.classList.contains('open');
      items.forEach((o) => { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('open'); $('button', it).setAttribute('aria-expanded', 'true'); }
      setTimeout(() => ST?.refresh(), 620);
    }));
  });

  // ---------- forms → email ----------
  $$('[data-mailform]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    $$('input[required], textarea[required]', f).forEach((x) => {
      const bad = !x.value.trim() || (x.type === 'email' && !/^\S+@\S+\.\S+$/.test(x.value));
      x.classList.toggle('bad', bad);
      if (bad && ok) { x.focus(); ok = false; }
    });
    const note = $('.form-note', f);
    if (!ok) { note.textContent = 'Please add your name, a valid email and a message.'; return; }
    const v = (n) => (f.elements[n]?.value || '').trim();
    const topic = f.elements.topic ? ($('input[name="topic"]:checked', f)?.value || '') : '';
    const subject = `${topic ? topic + ' — ' : ''}hello from ${v('name')}`;
    const body = `${v('message')}\n\n— ${v('name')}\n${v('email')}`;
    location.href = `mailto:rajchauhan3019@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Your email app should open with the message ready. If it didn’t, write to rajchauhan3019@gmail.com.';
  }));
  $$('[data-mailform] input, [data-mailform] textarea').forEach((x) => x.addEventListener('input', () => x.classList.remove('bad')));
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const t = b.textContent;
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied ✓'; } catch { b.textContent = b.dataset.copy; }
    setTimeout(() => { b.textContent = t; }, 1800);
  }));

  // ---------- terminal build log ----------
  const script = [
    ['$ ', 'git push origin main', 'cmd'], ['', '→ running checks', 'dim'], ['', '  ✓ lint   ✓ types   ✓ tests', 'ok'],
    ['', '→ deploying serverless functions', 'dim'], ['', '  ✓ POST /auth/login          live', 'ok'], ['', '  ✓ GET  /jobs/match          live', 'ok'],
    ['', '  ✓ POST /ai/score            live', 'ok'], ['', '→ building interface', 'dim'], ['', '  ✓ /dashboard   ✓ /matches   ✓ /tracker', 'ok'],
    ['', 'deployed · status: healthy', 'ok'],
  ];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  $$('[data-term]').forEach((t) => {
    const out = $('.rt-out', t);
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const render = (lines) => { out.innerHTML = lines.map(([pre, txt, k]) => (pre ? '<span class="p">raj@build</span>:~/api ' + esc(pre) : '') + (k === 'cmd' ? esc(txt) : `<span class="${k}">${esc(txt)}</span>`)).join('\n') + '<span class="cur"></span>'; };
    if (!motion) { render(script); return; }
    let started = false;
    new IntersectionObserver(([e], ob) => {
      if (!e.isIntersecting || started) return;
      started = true; ob.disconnect();
      (async () => {
        for (;;) {
          const done = [];
          for (const [pre, txt, k] of script) {
            if (k === 'cmd') { for (let i = 1; i <= txt.length; i++) { render([...done, [pre, txt.slice(0, i), k]]); await wait(45 + Math.random() * 50); } await wait(350); }
            else await wait(k === 'dim' ? 480 : 220);
            done.push([pre, txt, k]); render(done);
          }
          await wait(4500);
        }
      })();
    }, { threshold: 0.25 }).observe(t);
  });

  if (!motion) { enter(); return; }

  // =================================================================
  // Motion (GSAP)
  // =================================================================

  // headline word reveals
  $$('[data-words]').forEach((h) => {
    if (h.closest('[data-ph]') || h.closest('.nf')) { G.to($$('.mw', h), { y: 0, duration: 1.3, stagger: 0.06, delay: 0.5 }); return; }
    G.fromTo($$('.mw', h), { y: '110%', rotateX: -85, transformPerspective: 700, transformOrigin: '50% 100%' }, { y: 0, rotateX: 0, duration: 1.4, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });

  // fades
  // everything arrives in 3D: text tips up from below, grouped cards fly in from depth
  ST.batch('[data-fade]', { start: 'top 90%', once: true, onEnter: (els) => G.fromTo(els, { opacity: 0, y: 40, rotateX: -32, transformPerspective: 900, transformOrigin: '50% 0%' }, { opacity: 1, y: 0, rotateX: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', overwrite: true, clearProps: 'transform' }) });
  $$('[data-stagger]').forEach((g) => G.fromTo(g.children, { opacity: 0, y: 90, z: -320, rotateX: -62, rotateY: (i) => (i % 2 ? 12 : -12), transformPerspective: 1100, transformOrigin: '50% 100%' }, { opacity: 1, y: 0, z: 0, rotateX: 0, rotateY: 0, duration: 1.4, stagger: 0.07, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: g, start: 'top 88%', once: true } }));

  // media unclip
  $$('[data-reveal-media]').forEach((m) => G.to(m, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: m, start: 'top 85%', once: true } }));

  // parallax
  $$('[data-par]').forEach((el) => {
    const v = +el.dataset.par || 10;
    G.fromTo(el, { yPercent: -v }, { yPercent: v, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // scroll-filled text: words go from faint to full as you read down
  $$('[data-fill]').forEach((el) => {
    const parts = [];
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          const s = document.createElement('span'); s.className = 'fw'; s.textContent = w; frag.appendChild(s); parts.push(s);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1) { parts.push(node); }
    });
    G.fromTo(parts, { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true } });
  });

  // counters
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    el.style.display = 'inline-block'; el.style.minWidth = String(end).length + 'ch';
    G.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); }, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  // marquees that react to scroll speed and direction
  const vel = { v: 0, dir: 1 };
  ST.create({ onUpdate: (s) => { vel.v = Math.min(Math.abs(s.getVelocity()) / 300, 18); vel.dir = s.direction; } });
  const rails = [...$$('[data-band]').map((r) => [$('.band-track', r), +r.dataset.band, 0.6]), ...$$('[data-rail]').map((r) => [$('.sk-track', r), +r.dataset.rail, 0.45])];
  rails.forEach((r) => { r.x = 0; });
  let skew = 0;
  G.ticker.add(() => {
    skew += (Math.max(-3.2, Math.min(3.2, vel.v * vel.dir * 0.35)) - skew) * 0.12;
    html.style.setProperty('--skew', skew.toFixed(3));
    vel.v *= 0.92;
    rails.forEach((r) => {
      const [track, d, base] = r;
      const w = track.scrollWidth / (track.classList.contains('band-track') ? 3 : 4);
      r.x -= (base + vel.v) * d * vel.dir;
      if (r.x <= -w) r.x += w; if (r.x > 0) r.x -= w;
      track.style.transform = `translate3d(${r.x}px,0,0)`;
    });
  });

  // magnetic elements
  if (fine) $$('[data-magnetic]').forEach((el) => {
    const s = el.classList.contains('ftr-circle') ? 0.4 : 0.28;
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); G.to(el, { x: (e.clientX - r.left - r.width / 2) * s, y: (e.clientY - r.top - r.height / 2) * s, duration: 0.8 }); });
    el.addEventListener('pointerleave', () => G.to(el, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, .4)' }));
  });

  // tilt + spotlight + glare on cards, with inner [data-depth] layers that pop forward in 3D
  if (fine) [...new Set($$('[data-tilt], .stat, .ct-card, .tl-body, .cs-media, .wk-media, .prin-c, .quote-img'))].forEach((el) => {
    const big = el.matches('.cs-media, .wk-media, .ab-photo'), amt = big ? 7 : 13;
    el.classList.add('has-tilt');
    if (!el.querySelector(':scope > .glare')) el.insertAdjacentHTML('beforeend', '<span class="glare" aria-hidden="true"></span>');
    const deep = $$('[data-depth]', el);
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      G.to(el, { rotateY: (px - 0.5) * amt, rotateX: (0.5 - py) * amt, z: big ? 0 : 24, transformPerspective: 900, duration: 0.6, overwrite: 'auto' });
      deep.forEach((d) => G.to(d, { x: (px - 0.5) * +d.dataset.depth, y: (py - 0.5) * +d.dataset.depth, duration: 0.8, overwrite: 'auto' }));
    });
    el.addEventListener('pointerenter', (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%'); el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%'); });
    el.addEventListener('pointerleave', () => { G.to(el, { rotateY: 0, rotateX: 0, z: 0, duration: 1.1, ease: 'elastic.out(1, .5)', overwrite: 'auto' }); deep.forEach((d) => G.to(d, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, .5)' })); });
  });

  // custom cursor
  if (fine) {
    const cur = $('[data-cursor]'), dot = $('.cursor-dot', cur), ring = $('.cursor-ring', cur), lab = $('[data-cursor-label]');
    html.classList.add('has-cursor');
    const p = { x: innerWidth / 2, y: innerHeight / 2 }, r = { ...p };
    const qx = G.quickSetter(dot, 'x', 'px'), qy = G.quickSetter(dot, 'y', 'px'), rx = G.quickSetter(ring, 'x', 'px'), ry = G.quickSetter(ring, 'y', 'px');
    addEventListener('pointermove', (e) => { p.x = e.clientX; p.y = e.clientY; qx(p.x); qy(p.y); cur.classList.remove('is-hidden'); }, { passive: true });
    G.ticker.add(() => { r.x += (p.x - r.x) * 0.14; r.y += (p.y - r.y) * 0.14; rx(r.x); ry(r.y); });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor-text]');
      const l = e.target.closest('a, button, .sk, label, .faq-it button');
      cur.classList.toggle('is-text', !!t);
      cur.classList.toggle('is-link', !t && !!l);
      if (t) lab.textContent = t.dataset.cursorText;
    });
    document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
  }

  // ---------- page-specific scenes (rebuilt on breakpoint change) ----------
  const mm = G.matchMedia();

  // HOME HERO: pinned while the page slides over it; name splits, portrait recedes
  const hero = $('[data-hero]');
  if (hero) {
    mm.add('(min-width: 861px)', () => {
      // one trigger pins the hero and drives its scroll scene (a second trigger on the pinned
      // element measured its start a full screen late, so the scene never played)
      const tl = G.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', pin: true, pinSpacing: false, scrub: true } });
      tl.to('.hn-1', { xPercent: -18, yPercent: -10, ease: 'none' }, 0)
        .to('.hn-2', { xPercent: 12, ease: 'none' }, 0)
        .to('[data-hero-portrait]', { yPercent: -8, scale: 0.9, ease: 'none' }, 0)
        .to('.hero-intro, .hero-bottom', { yPercent: -60, opacity: 0, ease: 'none' }, 0)
        .to('.hc-proj', { yPercent: -120, rotate: -8, ease: 'none' }, 0)
        .to('.hc-talk', { yPercent: -60, ease: 'none' }, 0)
        .to(hero, { '--shade': 0.65, ease: 'none' }, 0);
      // mouse depth
      if (fine) {
        const layers = $$('[data-mouse]', hero).map((el) => [el, +el.dataset.mouse]);
        const move = (e) => { const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5; layers.forEach(([el, d]) => G.to(el, { x: dx * d * 2, y: dy * d * 2, duration: 1.4, ease: 'power3.out' })); };
        hero.addEventListener('pointermove', move);
        return () => hero.removeEventListener('pointermove', move);
      }
    });
    mm.add('(max-width: 860px)', () => {
      G.to('[data-hero-portrait]', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      G.to('.hn-1', { xPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  // HOME WORK: horizontal pinned gallery on desktop
  const work = $('[data-work]');
  if (work) {
    const track = $('[data-work-track]'), pin = $('[data-work-pin]'), bar = $('[data-work-bar]'), idx = $('[data-work-i]');
    const cards = $$('[data-wk]', work);
    mm.add('(min-width: 861px)', () => {
      const dist = () => track.scrollWidth - innerWidth;
      const tween = G.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (s) => { bar.style.transform = `scaleX(${s.progress})`; idx.textContent = String(Math.min(cards.length, Math.floor(s.progress * cards.length) + 1)).padStart(2, '0'); },
        },
      });
      cards.forEach((c) => {
        G.fromTo($('[data-wk-par]', c), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'left 30%', scrub: true } });
      });
      // 3D gallery: cards swing in from the right edge, face you in the centre, and recede on the left
      const all = [...cards, $('.wk-more', work)].filter(Boolean);
      let on = false;
      const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; }, { rootMargin: '10% 0px' }); io.observe(pin);
      const swing = () => {
        if (!on) return;
        const W = innerWidth;
        all.forEach((c) => {
          const r = c.getBoundingClientRect(), off = Math.max(-1.6, Math.min(1.6, (r.left + r.width / 2 - W * 0.42) / (W * 0.55))), a = Math.abs(off);
          c.style.transform = `perspective(1500px) translate3d(0, ${(a * 26).toFixed(1)}px, ${(-a * 170).toFixed(1)}px) rotateY(${(-off * 24).toFixed(2)}deg) rotateZ(${(off * 1.5).toFixed(2)}deg)`;
          c.style.opacity = (1 - Math.max(0, a - 0.9) * 0.6).toFixed(3);
        });
      };
      G.ticker.add(swing);
      return () => { G.ticker.remove(swing); io.disconnect(); all.forEach((c) => { c.style.transform = ''; c.style.opacity = ''; }); };
    });
    mm.add('(max-width: 860px)', () => {
      cards.forEach((c) => {
        G.fromTo($('[data-wk-par]', c), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 35%', scrub: true } });
        G.from(c, { y: 60, opacity: 0, duration: 1.2, scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
      });
    });
  }

  // CAPABILITIES: sticky stack, earlier cards recede as the next arrives
  // WHAT I DO: a full-screen stage. Scrolling flies the camera along five stations (API → Cloud → Data → AI → UI):
  // stations turn and recede like a coverflow, the floor grid and dust slide with parallax, a glowing pipe fills
  // between the cards' ports with packets running along it, and the copy for each station swaps in at the bottom.
  const svc = $('[data-svc]');
  if (svc) {
    const items = $$('[data-svc-item]', svc), sts = $$('[data-st]', svc), infs = $$('[data-svc-inf]', svc), ticks = $$('[data-tick]', svc);
    const flow = $('[data-flow]', svc), track = $('[data-flow-track]', svc), pipe = $('[data-flow-pipe]', svc);
    const base = $('[data-fp-base]', svc), segs = $$('[data-fp-seg]', svc), pks = $$('[data-fpk]', svc), flowLine = $('[data-fp-flow]', svc);
    const floor = $('[data-svc-floor]', svc), dust = $$('[data-dust]', svc), tfill = $('[data-ticks-fill]', svc);
    const N = items.length;
    let cur = -1, st = null;
    const set = (k) => {
      if (k === cur) return; cur = k;
      items.forEach((el, i) => { el.classList.toggle('is-on', i === k); el.classList.toggle('is-done', i < k); $('.svc-row', el).setAttribute('aria-expanded', i === k); });
      sts.forEach((el, i) => el.classList.toggle('is-on', i === k));
      infs.forEach((el, i) => { el.classList.toggle('is-on', i === k); el.classList.toggle('is-done', i < k); });
      ticks.forEach((el, i) => { el.classList.toggle('is-on', i === k); el.classList.toggle('is-done', i < k); });
      tfill.style.setProperty('--p', (k + 1) / N);
    };
    // the pipe: an S-curve from each card's right port to the next card's left port. Ports live inside the
    // 3D cards, so the pipe is re-measured every frame while the scene is on screen and always meets them.
    const portsL = sts.map((el) => $('[data-port-l]', el)), portsR = sts.map((el) => $('[data-port-r]', el));
    const f1 = (n) => n.toFixed(1);
    const drawPipe = () => {
      const tr = track.getBoundingClientRect();
      const c = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 - tr.left, r.top + r.height / 2 - tr.top]; };
      const L = portsL.map(c), R = portsR.map(c);
      const W = track.offsetWidth, H = track.offsetHeight;
      pipe.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const segD = R.slice(0, -1).map(([ox, oy], k) => {
        const [ix, iy] = L[k + 1], d = Math.max(50, (ix - ox) * 0.5), dy = (k % 2 ? -1 : 1) * H * 0.22;
        return `C${f1(ox + d)} ${f1(oy + dy)} ${f1(ix - d)} ${f1(iy - dy)} ${f1(ix)} ${f1(iy)}`;
      });
      segD.forEach((d, k) => segs[k].setAttribute('d', `M${f1(R[k][0])} ${f1(R[k][1])}${d}`));
      let full = `M${f1(L[0][0] - W * 0.3)} ${f1(L[0][1])}L${f1(L[0][0])} ${f1(L[0][1])}`;
      segD.forEach((d, k) => { full += `M${f1(R[k][0])} ${f1(R[k][1])}` + d; });
      const last = R[N - 1];
      full += `M${f1(last[0])} ${f1(last[1])}L${f1(last[0] + W * 0.3)} ${f1(last[1])}`;
      base.setAttribute('d', full); flowLine.setAttribute('d', full);
      const joined = `M${f1(R[0][0])} ${f1(R[0][1])}` + segD.map((d, k) => d + (k < segD.length - 1 ? `L${f1(R[k + 1][0])} ${f1(R[k + 1][1])}` : '')).join('');
      pks.forEach((pk) => { pk.style.offsetPath = `path("${joined}")`; });
      flow.classList.add('has-path');
    };
    // coverflow: every station's offset from the camera drives its turn, depth and fade; the world slides with parallax
    const place = (t) => {
      sts.forEach((el, k) => {
        const off = k - t, a = Math.abs(off);
        el.style.setProperty('--off', off.toFixed(3)); el.style.setProperty('--aoff', a.toFixed(3));
        el.style.setProperty('--depth', Math.max(0.15, 1.5 - a * 1.6).toFixed(3));
        el.classList.toggle('is-done', k < t - 0.5);
      });
      floor.style.setProperty('--gx', (-t * 420).toFixed(1));
      dust.forEach((d, i) => { d.style.transform = `translate3d(${(-t * [60, 140, 300][i]).toFixed(1)}px,0,0)`; });
    };
    mm.add('(min-width: 1001px)', () => {
      svc.classList.add('is-live');
      set(0); place(0);
      const sw = () => flow.clientWidth * 0.52;
      requestAnimationFrame(drawPipe);
      const tl = G.timeline({ defaults: { ease: 'none' } });
      for (let k = 0; k < N - 1; k++) {
        tl.to(track, { x: () => -(k + 1) * sw(), duration: 1, ease: 'power2.inOut' }, k)
          .fromTo(segs[k], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.75, ease: 'power1.inOut' }, k + 0.1);
      }
      tl.to({}, { duration: 0.3 });
      st = ST.create({ trigger: svc, start: 'top top', end: () => '+=' + innerHeight * (N - 0.5) * 0.9, pin: $('[data-svc-pin]', svc), animation: tl, scrub: 0.9, invalidateOnRefresh: true,
        onRefresh: drawPipe, onToggle: (self) => html.classList.toggle('svc-on', self.isActive) });
      tl.eventCallback('onUpdate', () => { const t = Math.min(N - 1, tl.time()); place(t); set(Math.max(0, Math.min(N - 1, Math.round(t - 0.2)))); });
      // keep the pipe glued to the moving 3D ports while the scene is on screen
      const tick = () => { if (st && st.isActive) drawPipe(); };
      G.ticker.add(tick);
      // entering the stage: the first card flies in from deep space
      G.fromTo(sts[0].querySelector('[data-st-tilt]'), { opacity: 0 }, { opacity: 1, duration: 1, scrollTrigger: { trigger: svc, start: 'top 70%', once: true } });
      let off = () => {};
      if (fine) {
        const stage = $('[data-svc-vis]', svc);
        const move = (e) => { const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5; G.to(sts, { '--ty': dx * 22, '--tx': -dy * 16, duration: 1, ease: 'power3.out', overwrite: 'auto' }); };
        const leave = () => G.to(sts, { '--ty': 0, '--tx': 0, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
        stage.addEventListener('pointermove', move); stage.addEventListener('pointerleave', leave);
        off = () => { stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave); };
      }
      return () => { G.ticker.remove(tick); off(); html.classList.remove('svc-on'); svc.classList.remove('is-live'); st = null; cur = -1; G.set([track, ...segs, ...sts], { clearProps: 'all' }); };
    });
    // card layout: run each graphic only while it's on screen
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('in-view', e.isIntersecting)), { rootMargin: '0px 0px -10% 0px' });
      items.forEach((el) => io.observe(el));
    } else items.forEach((el) => el.classList.add('in-view'));
    // clicking a step (tab or list) jumps to it
    $$('[data-svc-go]', svc).forEach((b) => b.addEventListener('click', () => {
      const k = +b.dataset.svcGo;
      if (st) scrollTo(st.start + (st.end - st.start) * Math.min(1, (k + 0.05) / (N - 0.7)), { offset: 0 });
    }));
  }

  // PROCESS: line draws, steps light up
  const proc = $('[data-proc]');
  if (proc) {
    const fill = $('[data-proc-fill]'), stepsEl = $$('[data-pstep]', proc);
    mm.add({ d: '(min-width: 861px)', m: '(max-width: 860px)' }, (ctx) => {
      const prop = ctx.conditions.d ? 'scaleX' : 'scaleY';
      G.set(fill, { scaleX: ctx.conditions.d ? 0 : 1, scaleY: ctx.conditions.d ? 1 : 0 });
      G.to(fill, { [prop]: 1, ease: 'none', scrollTrigger: { trigger: $('.proc-row', proc), start: 'top 75%', end: 'bottom 55%', scrub: true, onUpdate: (s) => stepsEl.forEach((st, i) => st.classList.toggle('on', s.progress >= i / stepsEl.length + 0.02)) } });
    });
    // the whole row lies flat on the floor and stands up as it scrolls in
    mm.add('(min-width: 861px)', () => { G.fromTo($('.proc-row', proc), { rotateX: 58, y: 120, z: -160, transformOrigin: '50% 100%' }, { rotateX: 0, y: 0, z: 0, ease: 'none', scrollTrigger: { trigger: proc, start: 'top 95%', end: 'top 25%', scrub: true } }); });
  }

  // REEL: grows from a card to near full-bleed
  $$('[data-reel-box]').forEach((b) => {
    G.fromTo(b, { scale: 0.62, rotateX: 34, y: 60 }, { scale: 1, rotateX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'center 55%', scrub: true } });
    $$('[data-rchip]', b).forEach((c) => G.fromTo(c, { y: +c.dataset.rchip }, { y: -c.dataset.rchip * 0.6, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });

  // TIMELINE: progress line
  $$('[data-tl]').forEach((t) => {
    const its = $$('[data-tl-it]', t), list = $('.tl-list', t);
    G.to($('[data-tl-fill]', t), { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: true,
      onUpdate: (s) => { const lh = list.offsetHeight; its.forEach((it) => it.classList.toggle('lit', s.progress * lh >= it.offsetTop + 30)); } } });
    // each entry swings in from the line like a door
    its.forEach((it) => G.fromTo(it, { opacity: 0, rotateY: -38, x: -40, transformPerspective: 1200, transformOrigin: '0% 50%' }, { opacity: 1, rotateY: 0, x: 0, duration: 1.4, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: it, start: 'top 85%', once: true } }));
  });

  // QUOTE: the portrait card swings round as it passes; the person pops out of the card
  $$('[data-q3d]').forEach((q) => {
    G.fromTo(q, { rotateY: -26, rotateX: 8 }, { rotateY: 14, rotateX: -4, ease: 'none', scrollTrigger: { trigger: q, start: 'top bottom', end: 'bottom top', scrub: true } });
    G.fromTo($('.q-person', q), { yPercent: 14, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: q, start: 'top 80%', once: true } });
    G.from($$('.q-chip', q), { scale: 0, opacity: 0, duration: 1, stagger: 0.15, ease: 'back.out(2)', scrollTrigger: { trigger: q, start: 'top 65%', once: true } });
  });

  // INNER PAGE HERO: the wireframe orb follows the mouse and drifts away on scroll
  $$('[data-orb]').forEach((o) => {
    const t = $('[data-orb-tilt]', o);
    if (fine) addEventListener('pointermove', (e) => G.to(t, { '--oy': (e.clientX / innerWidth - 0.5) * 40, '--ox': (e.clientY / innerHeight - 0.5) * -30, duration: 1.4, ease: 'power3.out', overwrite: 'auto' }), { passive: true });
    G.fromTo(o, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, ease: 'expo.out', delay: 0.4 });
    G.to(o, { yPercent: 30, scale: 0.8, ease: 'none', scrollTrigger: { trigger: o.closest('[data-ph]'), start: 'top top', end: 'bottom top', scrub: true } });
  });

  // CASE STUDIES: media zooms out of depth as it scrolls
  $$('.cs-media-in').filter((m) => m.querySelector(':scope > img')).forEach((m) => G.fromTo(m, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'center center', scrub: true } }));

  // WORK PAGE: image preview that follows the cursor over the index
  const float = $('[data-preview-float]');
  if (float && fine) {
    const im = $('img', float); const pos = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    $$('[data-preview]').forEach((row) => {
      row.addEventListener('pointerenter', () => { if (row.dataset.preview) { im.src = row.dataset.preview; float.classList.add('on'); } });
      row.addEventListener('pointerleave', () => float.classList.remove('on'));
    });
    addEventListener('pointermove', (e) => { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });
    G.ticker.add(() => { cur.x += (pos.x - cur.x) * 0.12; cur.y += (pos.y - cur.y) * 0.12; float.style.translate = `${cur.x + 24}px ${cur.y - 110}px`; float.style.rotate = `${(pos.x - cur.x) * 0.04}deg`; });
  }

  // FOOTER: curtain reveal on desktop when it fits the screen
  const page = $('[data-page]'), ftr = $('[data-footer]');
  const curtain = () => {
    const fits = desktop() && ftr.offsetHeight < innerHeight - 20;
    document.body.classList.toggle('has-curtain', fits);
    page.style.marginBottom = fits ? ftr.offsetHeight + 'px' : '';
  };
  curtain();
  addEventListener('resize', () => { curtain(); });
  G.to($$('.ftr-line > span'), { y: 0, duration: 1.3, stagger: 0.1, scrollTrigger: { trigger: page, start: 'bottom 75%', once: true } });
  G.fromTo($$('.ftr-word span'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.03, ease: 'none', scrollTrigger: { trigger: page, start: 'bottom 70%', end: 'bottom bottom', scrub: true } });
  // the big name waves in 3D toward the cursor
  const fw = $('[data-ftr-word]');
  if (fw && fine) {
    const ls = $$('i', fw);
    fw.addEventListener('pointermove', (e) => ls.forEach((l) => {
      const r = l.getBoundingClientRect(), d = (e.clientX - (r.left + r.width / 2)) / innerWidth, f = Math.max(0, 1 - Math.abs(d) * 5);
      G.to(l, { y: -f * 34, rotateX: f * 26, rotateY: d * -40 * f, z: f * 80, color: f > 0.6 ? '#fff' : '', duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    }));
    fw.addEventListener('pointerleave', () => G.to(ls, { y: 0, rotateX: 0, rotateY: 0, z: 0, color: '', duration: 1.2, ease: 'elastic.out(1, .4)', stagger: 0.02 }));
  }
  mm.add('(min-width: 861px)', () => { G.fromTo('.ftr-in', { yPercent: -25 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: page, start: 'bottom bottom+=' + innerHeight * 0.6, end: 'bottom bottom', scrub: true } }); });

  // refresh after fonts/images settle
  document.fonts?.ready.then(() => ST.refresh());
  addEventListener('load', () => { curtain(); ST.refresh(); });

  enter();
})();
