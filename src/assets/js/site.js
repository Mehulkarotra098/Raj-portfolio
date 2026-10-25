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

  function enter() {
    if (!motion) { document.body.classList.add('is-in'); return; }
    if (!seen && loader) {
      lenis?.stop();
      const n = $('[data-loader-n]'), bar = $('[data-loader-bar]');
      const c = { v: 0 };
      const tl = G.timeline();
      tl.to($$('.loader-word .m > span'), { y: 0, duration: 1, stagger: 0.09 }, 0.1)
        .to(c, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: () => { n.textContent = String(Math.round(c.v)).padStart(3, '0'); } }, 0)
        .to(bar, { scaleX: 1, duration: 1.7, ease: 'power2.inOut' }, 0)
        .to($$('.loader-word .m > span'), { y: '-105%', duration: 0.7, stagger: 0.05, ease: 'expo.in' }, 1.85)
        .to(loader, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 2.35)
        .add(() => { intro(); lenis?.start(); }, 2.55)
        .set(loader, { display: 'none' });
    } else if (wipe) {
      G.set(wipe, { yPercent: 0 });
      G.to(wipe, { yPercent: -100, duration: 1, ease: 'expo.inOut', delay: 0.05, onStart: () => setTimeout(intro, 280) });
    } else intro();
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
    G.fromTo(wipe, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: 'expo.inOut', onComplete: () => { location.href = url.href; } });
  });
  addEventListener('pageshow', (e) => { if (e.persisted && wipe && motion) G.set(wipe, { yPercent: -100 }); });

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
        .fromTo('[data-hero-portrait]', { opacity: 0, filter: 'blur(18px)', y: 70, scale: 1.06 }, { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1, duration: 1.8 }, 0.75)
        .fromTo($$('.hn-2 .ch > span', hero), { opacity: 0, filter: 'blur(20px)', y: 20 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.3, stagger: 0.06 }, 1.0)
        .fromTo('[data-hero-ui]', { opacity: 0, y: 34, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.12 }, 1.2)
        .add(() => {
          // portrait keeps breathing so the hero never sits still
          G.to('.hp-in img', { y: -12, rotate: 0.6, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          G.to('.hc-proj .hc-img img', { scale: 1.08, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          G.set([...$$('.hn .ch > span', hero), '[data-hero-portrait]', ...$$('[data-hero-ui]', hero)], { filter: 'none' });
        });
    }
    const ph = $('[data-ph]');
    if (ph) G.to($$('.ph-h .ch > span', ph), { y: 0, duration: 1.3, stagger: 0.04, delay: 0.05 });
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
    G.to($$('.mw', h), { y: 0, duration: 1.25, stagger: 0.06, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });

  // fades
  ST.batch('[data-fade]', { start: 'top 90%', once: true, onEnter: (els) => G.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, overwrite: true }) });
  $$('[data-stagger]').forEach((g) => G.to(g.children, { opacity: 1, y: 0, duration: 1, stagger: 0.06, scrollTrigger: { trigger: g, start: 'top 88%', once: true } }));

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
  G.ticker.add(() => {
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

  // tilt + spotlight on cards
  if (fine) $$('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      G.to(el, { rotateY: (px - 0.5) * 10, rotateX: (0.5 - py) * 10, transformPerspective: 800, duration: 0.6 });
    });
    el.addEventListener('pointerenter', (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%'); el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%'); });
    el.addEventListener('pointerleave', () => G.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, .5)' }));
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
      ST.create({ trigger: hero, start: 'top top', end: 'bottom top', pin: true, pinSpacing: false });
      const tl = G.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
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
        G.fromTo(c, { rotate: 2.5, y: 40 }, { rotate: 0, y: 0, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'left 40%', scrub: true } });
      });
    });
    mm.add('(max-width: 860px)', () => {
      cards.forEach((c) => {
        G.fromTo($('[data-wk-par]', c), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 35%', scrub: true } });
        G.from(c, { y: 60, opacity: 0, duration: 1.2, scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
      });
    });
  }

  // CAPABILITIES: sticky stack, earlier cards recede as the next arrives
  const caps = $$('[data-cap]');
  if (caps.length) mm.add('(min-width: 861px)', () => {
    caps.forEach((c, i) => {
      const next = caps[i + 1];
      if (!next) return;
      G.to($('.cap-in', c), { scale: 0.9, yPercent: -3, filter: 'brightness(.7)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true } });
    });
  });
  caps.forEach((c) => G.from($('.cap-r', c), { clipPath: 'inset(0 0 100% 0 round 18px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: c, start: 'top 75%', once: true } }));

  // PROCESS: line draws, steps light up
  const proc = $('[data-proc]');
  if (proc) {
    const fill = $('[data-proc-fill]'), stepsEl = $$('[data-pstep]', proc);
    mm.add({ d: '(min-width: 861px)', m: '(max-width: 860px)' }, (ctx) => {
      const prop = ctx.conditions.d ? 'scaleX' : 'scaleY';
      G.set(fill, { scaleX: ctx.conditions.d ? 0 : 1, scaleY: ctx.conditions.d ? 1 : 0 });
      G.to(fill, { [prop]: 1, ease: 'none', scrollTrigger: { trigger: $('.proc-row', proc), start: 'top 75%', end: 'bottom 55%', scrub: true, onUpdate: (s) => stepsEl.forEach((st, i) => st.classList.toggle('on', s.progress >= i / stepsEl.length + 0.02)) } });
    });
    G.from(stepsEl, { y: 50, opacity: 0, stagger: 0.12, duration: 1.1, scrollTrigger: { trigger: proc, start: 'top 75%', once: true } });
  }

  // REEL: grows from a card to near full-bleed
  $$('[data-reel-box]').forEach((b) => {
    G.fromTo(b, { scale: 0.62, borderRadius: 40 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'center 55%', scrub: true } });
  });

  // TIMELINE: progress line
  $$('[data-tl]').forEach((t) => G.to($('[data-tl-fill]', t), { scaleY: 1, ease: 'none', scrollTrigger: { trigger: $('.tl-list', t), start: 'top 70%', end: 'bottom 60%', scrub: true } }));

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
  mm.add('(min-width: 861px)', () => { G.fromTo('.ftr-in', { yPercent: -25 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: page, start: 'bottom bottom+=' + innerHeight * 0.6, end: 'bottom bottom', scrub: true } }); });

  // refresh after fonts/images settle
  document.fonts?.ready.then(() => ST.refresh());
  addEventListener('load', () => { curtain(); ST.refresh(); });

  enter();
})();
