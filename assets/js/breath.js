/* =========================================================
   SŌMA — guided breathing engine
   Drives any [data-breath] widget on the page.
   Config comes from each .pattern button's data-* attributes.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$, clamp } = window.Soma;
  const RING_LEN = 2 * Math.PI * 138;

  const LABELS = {
    idle: { label: 'Ready?', hint: 'press begin' },
    inhale: { label: 'Inhale', hint: 'through the nose' },
    inhale2: { label: 'Inhale', hint: 'top up gently' },
    hold: { label: 'Hold', hint: 'stay soft' },
    holdIn: { label: 'Hold', hint: 'lungs full' },
    exhale: { label: 'Exhale', hint: 'let it fall out' },
    holdOut: { label: 'Hold', hint: 'empty & still' }
  };

  const num = (el, key) => {
    const v = parseFloat(el.dataset[key]);
    return Number.isFinite(v) ? v : 0;
  };

  function readConfig(btn) {
    return {
      name: btn.dataset.name || 'Breathing',
      inhale: num(btn, 'in') || 4,
      holdIn: num(btn, 'holdin'),
      exhale: num(btn, 'out') || 4,
      holdOut: num(btn, 'holdout'),
      topUp: num(btn, 'topup'),
      meta: btn.querySelector('.pattern__meta')?.textContent.trim() || ''
    };
  }

  /** Build the ordered phases of one breath cycle. */
  function phasesFor(c) {
    const p = [{ key: 'inhale', dur: c.inhale, from: 0.86, to: 1.14 }];
    if (c.topUp > 0) p.push({ key: 'inhale2', dur: c.topUp, from: 1.14, to: 1.24 });
    if (c.holdIn > 0) p.push({ key: 'hold', dur: c.holdIn, from: 1.24, to: 1.24 });
    p.push({ key: 'exhale', dur: c.exhale, from: 1.24, to: 0.86 });
    if (c.holdOut > 0) p.push({ key: 'holdOut', dur: c.holdOut, from: 0.86, to: 0.86 });
    return p;
  }

  function initWidget(wrap) {
    const orb = $('.breath-orb', wrap);
    const phaseEl = $('#boPhase', wrap);
    const countEl = $('#boCount', wrap);
    const hintEl = $('#boHint', wrap);
    const ring = $('.bo__ring', wrap);
    const halo = $('.bo__halo--1', orb);
    const toggle = $('#breathToggle', wrap);
    const toggleLabel = $('#breathToggleLabel', wrap);
    const toggleIcon = $('#breathToggleIcon use', wrap);
    const resetBtn = $('#breathReset', wrap);
    const statCycles = $('#statCycles', wrap);
    const statTime = $('#statTime', wrap);
    const statRhythm = $('#statRhythm', wrap);
    const section = wrap.closest('section') || document;
    const descEl = $('.patterns__note p', section);
    const noteEl = $('.patterns__note', section);
    const patterns = $$('.pattern', section);

    let cfg = patterns.length ? readConfig($('.pattern.is-active', section)) : {
      inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, topUp: 0
    };
    let phases = phasesFor(cfg);

    let running = false;
    let stage = 0;
    let stageElapsed = 0;
    let phaseStart = 0;
    let scaleFrom = 0.86, scaleTo = 0.86;
    let rafId = null;
    let firstStart = true;
    let lastTickSec = -1;
    let sessionStart = 0;
    let elapsed = 0;
    let cycles = 0;

    function setScale(v) {
      orb.style.setProperty('--s', v.toFixed(4));
      if (halo) halo.style.transform = `scale(${(0.85 + (v - 0.86) * 1.6).toFixed(3)})`;
    }

    function setPhaseUI(key, countText) {
      orb.dataset.phase = key;
      phaseEl.textContent = LABELS[key].label;
      hintEl.textContent = LABELS[key].hint;
      if (countText !== undefined) countEl.textContent = countText;
    }

    function tickCount(n) {
      countEl.textContent = n;
      countEl.classList.remove('is-tick');
      void countEl.offsetWidth;
      countEl.classList.add('is-tick');
    }

    function enterStage(i) {
      stage = i;
      const ph = phases[i];
      stageElapsed = 0;
      phaseStart = performance.now();
      scaleFrom = ph.from;
      scaleTo = ph.to;
      setPhaseUI(ph.key);
      lastTickSec = -1;
      const first = Math.ceil(ph.dur);
      tickCount(first);
      lastTickSec = first;
    }

    function loop(now) {
      if (!running) return;
      const ph = phases[stage];
      const t = (now - phaseStart) / 1000;
      const p = clamp((stageElapsed + t) / ph.dur, 0, 1);

      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setScale(scaleFrom + (scaleTo - scaleFrom) * eased);

      if (ring) ring.style.strokeDashoffset = (RING_LEN * (1 - p)).toFixed(2);

      const left = Math.max(0, Math.ceil(ph.dur - (stageElapsed + t)));
      if (left !== lastTickSec && left > 0) { tickCount(left); lastTickSec = left; }

      elapsed = (now - sessionStart) / 1000;
      const mm = Math.floor(elapsed / 60);
      const ss = Math.floor(elapsed % 60);
      statTime.textContent = `${mm}:${String(ss).padStart(2, '0')}`;

      if (p >= 1) {
        if (stage + 1 < phases.length) enterStage(stage + 1);
        else {
          cycles++;
          statCycles.textContent = cycles;
          enterStage(0);
        }
      }
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      running = true;
      sessionStart = performance.now() - elapsed * 1000;
      orb.classList.add('is-running');
      toggle.classList.add('is-on');
      toggleLabel.textContent = 'Pause';
      toggleIcon.setAttribute('href', '#i-pause');
      toggle.setAttribute('aria-label', 'Pause breathing');
      if (firstStart) { firstStart = false; enterStage(0); }
      else {
        phaseStart = performance.now();
        setPhaseUI(phases[stage].key, Math.max(1, Math.ceil(phases[stage].dur - stageElapsed)));
      }
      rafId = requestAnimationFrame(loop);
    }

    function pause() {
      running = false;
      cancelAnimationFrame(rafId);
      stageElapsed = clamp(stageElapsed + (performance.now() - phaseStart) / 1000, 0, phases[stage].dur);
      orb.classList.remove('is-running');
      toggle.classList.remove('is-on');
      toggleLabel.textContent = 'Resume';
      toggleIcon.setAttribute('href', '#i-play');
      toggle.setAttribute('aria-label', 'Resume breathing');
      phaseEl.textContent = 'Paused';
      hintEl.textContent = 'breathe naturally';
      countEl.textContent = '—';
    }

    function reset() {
      running = false;
      cancelAnimationFrame(rafId);
      elapsed = 0; cycles = 0; stage = 0; firstStart = true; stageElapsed = 0;
      phases = phasesFor(cfg);
      orb.classList.remove('is-running');
      toggle.classList.remove('is-on');
      toggleLabel.textContent = 'Begin';
      toggleIcon.setAttribute('href', '#i-play');
      toggle.setAttribute('aria-label', 'Start breathing');
      setPhaseUI('idle', '∞');
      setScale(0.86);
      if (ring) ring.style.strokeDashoffset = RING_LEN;
      statCycles.textContent = '0';
      statTime.textContent = '0:00';
    }

    toggle.addEventListener('click', () => (running ? pause() : start()));
    resetBtn.addEventListener('click', reset);
    orb.addEventListener('click', () => (running ? pause() : start()));

    patterns.forEach((btn) => {
      btn.addEventListener('click', () => {
        patterns.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        cfg = readConfig(btn);
        phases = phasesFor(cfg);

        if (descEl && btn.dataset.desc) {
          descEl.textContent = btn.dataset.desc;
          if (noteEl) {
            noteEl.classList.remove('is-swap');
            void noteEl.offsetWidth;
            noteEl.classList.add('is-swap');
          }
        }
        if (statRhythm && cfg.meta) statRhythm.textContent = cfg.meta.replace(/\s+/g, '');
        reset();
      });
    });

    setPhaseUI('idle', '∞');
    setScale(0.86);
    if (ring) ring.style.strokeDashoffset = RING_LEN;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && running) pause();
    });
  }

  function boot() {
    $$('[data-breath]').forEach(initWidget);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
