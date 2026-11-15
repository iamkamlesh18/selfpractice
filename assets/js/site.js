/* =========================================================
   SŌMA — shared site runtime
   Nav, scroll reveals, counters, starfield, footer year.
   Every page loads this; page-specific logic lives in
   breath.js · yoga.js · frequencies.js · chakra.js
   ========================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Starfield ---------- */
  function initStars() {
    const canvas = $('#stars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, stars = [], raf = null;
    const pointer = { x: -1e4, y: -1e4 };

    const colors = {
      white: 'rgba(243,238,252,',
      mint:  'rgba(121,242,220,',
      lilac: 'rgba(139,123,247,'
    };

    function build() {
      const count = Math.round(clamp((w * h) / 18000, 50, 160));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.25,
        a: Math.random(),
        speed: Math.random() * 0.012 + 0.003,
        drift: (Math.random() - 0.5) * 0.12,
        hue: Math.random() > 0.72 ? 'mint' : Math.random() > 0.5 ? 'lilac' : 'white'
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.a += s.speed;
        s.y -= s.drift;
        if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }
        if (s.y > h + 4) s.y = -4;

        const alpha = 0.25 + Math.sin(s.a) * 0.35 + 0.25;
        const near = Math.hypot(s.x - pointer.x, s.y - pointer.y) < 120;

        ctx.beginPath();
        ctx.arc(s.x, s.y, near ? s.r * 1.9 : s.r, 0, Math.PI * 2);
        ctx.fillStyle = colors[s.hue] + alpha.toFixed(3) + ')';
        ctx.fill();

        if (near) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = colors[s.hue] + '0.06)';
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; });
    window.addEventListener('pointerleave', () => { pointer.x = -1e4; pointer.y = -1e4; });

    resize();
    if (!prefersReduced) raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf && !prefersReduced) raf = requestAnimationFrame(frame);
    });
  }

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    const items = $$('.reveal');

    // Only hide content if we can definitively show it again.
    if (!('IntersectionObserver' in window) || !items.length) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    document.documentElement.classList.add('js-reveal');

    items.forEach((el) => {
      if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay);
    });

    $$('.hero__title .reveal-mask > span, .page-hero .reveal-mask > span').forEach((s, i) => {
      s.style.setProperty('--d', 120 + i * 110 + 'ms');
    });
    $$('.hero__title, .page-hero').forEach((t) => t.classList.add('is-in'));

    const show = (el) => {
      el.classList.add('is-in');
      io.unobserve(el);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) show(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach((el) => io.observe(el));

    // Backstop: anything already on screen after load must never stay hidden,
    // even if the observer never fires for it (very tall sections, zoomed text).
    window.setTimeout(() => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) show(el);
      });
    }, 900);
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = $('#nav');
    if (!nav) return;
    const burger = $('.nav__burger');

    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    burger?.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    $$('.nav__links a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger?.setAttribute('aria-expanded', 'false');
    }));

    // close the mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) nav.classList.remove('is-open');
    });

    // pointer sheen on buttons
    $$('.btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        b.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length) return;

    const format = (n, decimals) =>
      decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US');

    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = format(target, decimals) + suffix; return; }
      const dur = 1800;
      const start = performance.now();
      const step = (now) => {
        const p = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(target * eased, decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Shared audio helper (used by several pages) ---------- */
  const AudioKit = {
    ctx: null,
    master: null,
    ensure() {
      if (this.ctx) return this.ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(this.ctx.destination);
      return this.ctx;
    },
    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    /** soft bell / bowl tone */
    tone(freq = 440, dur = 3, vol = 0.12, type = 'sine') {
      const c = this.ensure();
      if (!c) return;
      this.resume();
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + dur + 0.05);
      return { osc: o, gain: g };
    }
  };

  window.Soma = { $, $$, clamp, prefersReduced, AudioKit };

  function boot() {
    initStars();
    initReveals();
    initNav();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
