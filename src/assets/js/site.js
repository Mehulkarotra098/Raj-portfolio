// Raj Chauhan — interactions and motion. Content stays visible if this file fails to run.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---------- smooth scroll ----------
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ---------- hero load sequence ----------
  const loaded = () => {
    requestAnimationFrame(() => document.body.classList.add('is-loaded'));
    setTimeout(() => document.body.classList.add('is-settled'), 2600);
  };
  const portrait = $('.hero-portrait img');
  if (portrait && !portrait.complete) { portrait.addEventListener('load', loaded, { once: true }); setTimeout(loaded, 1800); }
  else loaded();

  // ---------- split headings: index words for stagger ----------
  $$('[data-split]').forEach((h) => $$('.w', h).forEach((w, i) => w.style.setProperty('--wi', i)));

  // ---------- in-view reveals ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.matches('[data-count]')) count(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('[data-split], [data-reveal], [data-tilt], .cgrid, .cband, [data-footword], [data-count]').forEach((el) => io.observe(el));
  $$('[data-tilt]').forEach((el) => el.style.setProperty('--t', el.dataset.tilt));

  // ---------- counters (M05) ----------
  function count(el) {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    el.style.display = 'inline-block';
    el.style.minWidth = String(end).length + 'ch';
    const dur = 900 + Math.min(end, 400);
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------- menu (M14) ----------
  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  let lastFocus = null;
  const openMenu = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    openBtn.setAttribute('aria-expanded', 'true');
    lenis?.stop(); document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn.focus(), 60);
  };
  const closeMenu = () => {
    menu.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    lenis?.start(); document.body.style.overflow = '';
    setTimeout(() => { menu.hidden = true; }, reduce ? 0 : 400);
    lastFocus?.focus();
  };
  openBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  menu?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = $$('a, button', menu); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---------- sliders (M12) ----------
  $$('[data-slider]').forEach((s) => {
    const slides = $$('.slide', s), dots = $$('.dots button', s);
    let i = 0, timer = null, visible = false;
    const go = (n) => {
      slides[i].classList.remove('on'); dots[i].setAttribute('aria-selected', 'false');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('on'); dots[i].setAttribute('aria-selected', 'true');
    };
    const play = () => { if (!reduce && visible && !timer) timer = setInterval(() => go(i + 1), 3400 + Math.random() * 800); };
    const stop = () => { clearInterval(timer); timer = null; };
    dots.forEach((d, n) => d.addEventListener('click', () => { stop(); go(n); play(); }));
    s.addEventListener('mouseenter', stop); s.addEventListener('mouseleave', play);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? play() : stop(); }).observe(s);
  });

  // ---------- segmented toggle (M17) ----------
  $$('[data-seg]').forEach((b) => b.addEventListener('click', () => {
    const wrap = b.closest('.engage');
    $$('[data-seg]', wrap).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    $$('[data-seg-panel]', wrap).forEach((p) => { p.hidden = p.dataset.segPanel !== b.dataset.seg; });
  }));

  // ---------- FAQ (M18): single open ----------
  $$('[data-faq]').forEach((list) => {
    const items = $$('.faq-item', list);
    items.forEach((it) => $('button', it).addEventListener('click', () => {
      const open = !it.classList.contains('open');
      items.forEach((o) => { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); $('.faq-a', o).hidden = true; });
      if (open) { it.classList.add('open'); $('button', it).setAttribute('aria-expanded', 'true'); $('.faq-a', it).hidden = false; }
      lenis?.resize?.();
    }));
  });

  // ---------- media expansion (M06): the reel grows as it enters ----------
  const grows = $$('[data-grow]');
  if (grows.length && !reduce) {
    const tick = () => {
      const vh = innerHeight;
      grows.forEach((g) => {
        const r = g.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
        const e = 1 - Math.pow(1 - p, 2);
        g.style.transform = `scale(${0.72 + 0.28 * e})`;
        g.style.opacity = String(0.45 + 0.55 * e);
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---------- terminal typing in the reel ----------
  const script = [
    ['$ ', 'git push origin main', 'cmd'],
    ['', '→ running checks', 'dim'],
    ['', '  ✓ lint   ✓ types   ✓ tests', 'ok'],
    ['', '→ deploying serverless functions', 'dim'],
    ['', '  ✓ POST /auth/login          live', 'ok'],
    ['', '  ✓ GET  /jobs/match          live', 'ok'],
    ['', '  ✓ POST /ai/score            live', 'ok'],
    ['', '→ building interface', 'dim'],
    ['', '  ✓ /dashboard   ✓ /matches   ✓ /tracker', 'ok'],
    ['', 'deployed · status: healthy', 'done'],
  ];
  $$('[data-term]').forEach((t) => {
    const out = $('.rt-out', t);
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const render = (lines, partial) => {
      out.innerHTML = lines.map(([pre, txt, kind]) => {
        const p = pre ? '<b class="p">raj@build</b>:~/api ' + esc(pre) : '';
        const cls = kind === 'ok' ? 'ok' : kind === 'dim' ? 'dim' : kind === 'done' ? 'ok' : '';
        return p + (cls ? `<span class="${cls}">${esc(txt)}</span>` : esc(txt));
      }).join('\n') + (partial ? '' : '\n') + '<span class="cur"></span>';
    };
    if (reduce) { render(script, true); return; }
    let started = false;
    new IntersectionObserver(([e], ob) => {
      if (!e.isIntersecting || started) return;
      started = true; ob.disconnect();
      const run = async () => {
        while (true) {
          const done = [];
          for (const [pre, txt, kind] of script) {
            if (kind === 'cmd') {
              for (let n = 1; n <= txt.length; n++) { render([...done, [pre, txt.slice(0, n), kind]], true); await wait(55 + Math.random() * 50); }
              await wait(380);
            } else { await wait(kind === 'dim' ? 520 : 240); }
            done.push([pre, txt, kind]); render(done, true);
          }
          await wait(4200);
        }
      };
      run();
    }, { threshold: 0.3 }).observe(t);
  });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- mail forms (no backend: compose an email) ----------
  $$('[data-mailform]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = $$('input[required], textarea[required]', f);
    let ok = true;
    fields.forEach((x) => { const bad = !x.value.trim() || (x.type === 'email' && !/^\S+@\S+\.\S+$/.test(x.value)); x.classList.toggle('bad', bad); if (bad && ok) { x.focus(); ok = false; } });
    const note = $('.cform-note', f);
    if (!ok) { note.textContent = 'Please fill in your name, a valid email and a message.'; return; }
    const v = (n) => (f.elements[n]?.value || '').trim();
    const name = v('name') || [v('first'), v('last')].filter(Boolean).join(' ');
    const subject = `Hello Raj — from ${name}`;
    const body = `${v('message')}\n\n— ${name}\n${v('email')}`;
    location.href = `mailto:rajchauhan3019@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Your email app should open with the message ready. If it didn’t, write to rajchauhan3019@gmail.com.';
  }));
  $$('[data-mailform] input, [data-mailform] textarea').forEach((x) => x.addEventListener('input', () => x.classList.remove('bad')));

  // ---------- copy email ----------
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied ✓'; }
    catch { b.textContent = b.dataset.copy; }
    setTimeout(() => { b.textContent = 'Copy email'; }, 2000);
  }));

  // ---------- marquee speed scales with content width ----------
  $$('[data-marquee]').forEach((m) => {
    const row = $('.marquee-row', m);
    if (!row) return;
    const set = () => m.style.setProperty('--dur', Math.max(20, row.scrollWidth / (m.closest('.gal') ? 34 : m.classList.contains('slow') ? 26 : 40)) + 's');
    set(); addEventListener('resize', set);
  });

  // ---------- hero: gentle depth on scroll ----------
  const hero = $('[data-hero]');
  if (hero && !reduce) {
    const bg = $('.hero-bgname', hero), pt = $('.hero-portrait', hero);
    addEventListener('scroll', () => {
      const y = Math.min(scrollY, innerHeight);
      bg.style.translate = `0 ${y * 0.25}px`;
      if (innerWidth > 760) pt.style.translate = `0 ${y * 0.08}px`;
    }, { passive: true });
  }

  // in-page anchor links through Lenis
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1 && $(id)) { e.preventDefault(); lenis ? lenis.scrollTo(id) : $(id).scrollIntoView(); }
  }));
})();
