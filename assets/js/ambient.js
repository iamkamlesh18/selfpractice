/* =========================================================
   SŌMA — one audio engine for the whole site

   · Ambient track  : assets/audio/spiritual-ambient.ogg (CC BY 4.0)
   · Frequency tones: pure sine oscillators, one at a time
   · Dock           : floating mini-player on every page
   · Persistence    : what is playing is remembered in localStorage
                      and resumed on the next page, so audio follows
                      you around the site.

   Browsers forbid audio without a gesture, so playback is armed on
   the first click / key / scroll and the dock always shows a pause.
   ========================================================= */
(() => {
  'use strict';

  const STORE = 'soma.audio.v1';
  const TRACK = {
    id: 'ambient',
    title: 'Spiritual Ambient',
    sub: 'MusicLFiles · CC BY 4.0',
    src: 'assets/audio/spiritual-ambient.ogg',
    volume: 45
  };

  /* ---------- persisted state ---------- */
  const defaults = () => ({ kind: null, hz: null, name: null, paused: false, vol: 45, armed: false });

  function readState() {
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return defaults();
      const s = JSON.parse(raw);
      return Object.assign(defaults(), s);
    } catch (e) {
      return defaults();
    }
  }

  const state = readState();

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  /* ---------- audio graph ---------- */
  let ctx = null;
  let masterGain = null;
  let ambientEl = null;
  let tone = null;               // { osc, osc2, gain }

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = state.vol / 100;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  function resumeCtx() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function getAmbient() {
    if (ambientEl) return ambientEl;
    ambientEl = new Audio(TRACK.src);
    ambientEl.loop = true;
    ambientEl.preload = 'none';
    ambientEl.volume = state.vol / 100;
    ambientEl.addEventListener('error', () => {
      setSub('Audio file could not load');
    });
    return ambientEl;
  }

  /* ---------- dock UI ---------- */
  const dock = document.getElementById('dock');
  const dockTitle = document.getElementById('dockTitle');
  const dockSub = document.getElementById('dockSub');
  const dockArt = document.getElementById('dockArt');
  const dockToggle = document.getElementById('dockToggle');
  const dockMute = document.getElementById('dockMute');
  const dockVol = document.getElementById('dockVol');
  const dockClose = document.getElementById('dockClose');

  const promptEl = document.getElementById('ambientPrompt');
  const promptStart = document.getElementById('ambientStart');
  const promptNo = document.getElementById('ambientNo');

  const hasDock = !!dock;

  function setSub(text) {
    if (dockSub && text) dockSub.textContent = text;
  }

  function playing() {
    if (state.kind === 'ambient') return !!ambientEl && !ambientEl.paused && !ambientEl.ended;
    if (state.kind === 'tone') return !!tone;
    return false;
  }

  function render() {
    if (!hasDock) return;
    const active = state.kind === null ? false : true;

    dock.hidden = !active;
    document.body.classList.toggle('has-dock', active);
    if (!active) return;

    if (state.kind === 'ambient') {
      dockTitle.textContent = TRACK.title;
      dockSub.textContent = playing() ? TRACK.sub : 'Paused · ' + TRACK.sub;
      dockArt.style.setProperty('--dc', 'rgba(121,242,220,.35)');
      dockArt.classList.remove('is-tone');
    } else {
      dockTitle.textContent = `${state.hz} Hz`;
      dockSub.textContent = (state.name || 'Frequency') + (playing() ? '' : ' · paused');
      dockArt.style.setProperty('--dc', 'rgba(139,123,247,.45)');
      dockArt.classList.add('is-tone');
    }

    dock.classList.toggle('is-paused', !playing());
    dockToggle.innerHTML = `<svg viewBox="0 0 24 24" class="ico"><use href="#${playing() ? 'i-pause' : 'i-play'}"></use></svg>`;
    dockToggle.setAttribute('aria-label', playing() ? 'Pause' : 'Play');

    const muted = state.vol === 0;
    dockMute.innerHTML = `<svg viewBox="0 0 24 24" class="ico"><use href="#${muted ? 'i-mute' : 'i-volume'}"></use></svg>`;
    dockMute.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    dockVol.value = String(state.vol);

    // reflect state on frequency cards
    document.querySelectorAll('.freq').forEach((card) => {
      const isOn = state.kind === 'tone' && String(card.dataset.hz) === String(state.hz) && playing();
      const isPaused = state.kind === 'tone' && String(card.dataset.hz) === String(state.hz) && !playing();
      card.classList.toggle('is-playing', isOn || isPaused);
      const btn = card.querySelector('.freq__play');
      if (btn) {
        btn.setAttribute('aria-pressed', String(isOn));
        btn.innerHTML = `<svg viewBox="0 0 24 24" class="ico"><use href="#${isOn ? 'i-pause' : 'i-play'}"></use></svg> <span>${isOn ? 'Pause' : 'Play'}</span>`;
      }
    });
  }

  /* ---------- helpers ---------- */
  function setVolume(v) {
    state.vol = Math.max(0, Math.min(100, Number(v) || 0));
    if (ambientEl) ambientEl.volume = state.vol / 100;
    if (masterGain && ctx) masterGain.gain.setTargetAtTime(state.vol / 100, ctx.currentTime, 0.08);
    save();
    render();
  }

  function arming() {
    if (!state.armed) {
      state.armed = true;
      save();
    }
  }

  /* ---------- ambient ---------- */
  function startAmbient({ announce } = {}) {
    arming();
    stopTone();
    state.kind = 'ambient';
    state.hz = null;
    state.name = TRACK.title;
    state.paused = false;
    save();

    const el = getAmbient();
    el.volume = state.vol / 100;
    const p = el.play();
    if (p && p.catch) p.catch(() => setSub('Press play to start'));
    hidePrompt();
    render();
    if (announce) dock?.classList.add('is-flash');
  }

  function pauseAmbient() {
    if (ambientEl) ambientEl.pause();
    state.paused = true;
    save();
    render();
  }

  function resumeAmbient() {
    const el = getAmbient();
    el.volume = state.vol / 100;
    const p = el.play();
    if (p && p.catch) p.catch(() => setSub('Ready · press play'));
    state.paused = false;
    save();
    render();
  }

  /* ---------- tones ---------- */
  function startTone(hz, name) {
    const c = ensureCtx();
    if (!c) return;
    resumeCtx();
    stopAmbient();
    stopTone(true);

    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.85, c.currentTime + 1.1);
    g.connect(masterGain);

    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = hz;
    osc.connect(g);
    osc.start();

    const osc2 = c.createOscillator();
    const g2 = c.createGain();
    g2.gain.value = 0.12;
    osc2.type = 'triangle';
    osc2.frequency.value = hz * 2;
    osc2.connect(g2);
    g2.connect(g);
    osc2.start();

    // devices without Web Audio reach fallback: silent, but reflected in UI
    tone = { osc, osc2, gain: g };
    state.kind = 'tone';
    state.hz = hz;
    state.name = name;
    state.paused = false;
    arming();
    save();
    render();
  }

  function stopTone(keepState) {
    if (tone && ctx) {
      const t = ctx.currentTime;
      try {
        tone.gain.gain.cancelScheduledValues(t);
        tone.gain.gain.setTargetAtTime(0.0001, t, 0.12);
        tone.osc.stop(t + 1.2);
        tone.osc2.stop(t + 1.2);
      } catch (e) { /* already stopped */ }
    }
    tone = null;
    if (!keepState) {
      state.kind = null;
      state.hz = null;
      state.name = null;
      state.paused = false;
      save();
      render();
    }
  }

  function resumeTone() {
    if (state.hz == null) return;
    startTone(state.hz, state.name);
  }

  function stopAmbient() {
    if (ambientEl && !ambientEl.paused) ambientEl.pause();
  }

  /* ---------- public control ---------- */
  function toggle() {
    if (!state.kind) { showPrompt(); return; }
    if (state.kind === 'ambient') {
      if (playing()) pauseAmbient();
      else resumeAmbient();
    } else if (playing()) {
      stopTone();
    } else {
      resumeTone();
    }
  }

  /* ---------- prompt (first-visit nudge) ---------- */
  function hidePrompt() {
    if (promptEl) promptEl.hidden = true;
    sessionStorage.setItem('soma.prompt.done', '1');
  }

  function showPrompt() {
    if (!promptEl || sessionStorage.getItem('soma.prompt.done')) return;
    promptEl.hidden = false;
  }

  if (promptStart) {
    promptStart.addEventListener('click', () => startAmbient({ announce: true }));
  }
  if (promptNo) promptNo.addEventListener('click', hidePrompt);

  /* ---------- wire dock ---------- */
  if (hasDock) {
    dockToggle.addEventListener('click', toggle);
    dockClose.addEventListener('click', () => {
      stopTone();
      stopAmbient();
      state.kind = null; state.hz = null; state.name = null; state.paused = false;
      save();
      render();
    });
    dockMute.addEventListener('click', () => {
      if (state.vol === 0) {
        setVolume(state.lastVol || 45);
      } else {
        state.lastVol = state.vol;
        setVolume(0);
      }
    });
    dockVol.addEventListener('input', () => setVolume(dockVol.value));
  }

  /* ---------- frequency cards ---------- */
  document.querySelectorAll('.freq').forEach((card) => {
    const hz = Number(card.dataset.hz);
    const name = card.dataset.name;
    const playBtn = card.querySelector('.freq__play');
    const volBtn = card.querySelector('.freq__volbtn');
    const volRange = card.querySelector('.freq__volrange');

    if (volRange) {
      volRange.value = String(state.vol);
      volRange.addEventListener('input', () => setVolume(volRange.value));
      volRange.addEventListener('click', (e) => e.stopPropagation());
    }

    if (volBtn) {
      // the slider opens on hover; the button toggles it for touch / keyboard
      volBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = card.classList.toggle('is-vol-open');
        volBtn.setAttribute('aria-expanded', String(open));
      });
    }

    const activate = (e) => {
      if (e) e.stopPropagation();
      const isThis = state.kind === 'tone' && String(hz) === String(state.hz);
      if (isThis && playing()) {
        stopTone();
      } else if (isThis && !playing()) {
        resumeTone();
      } else {
        startTone(hz, name);
      }
    };

    if (playBtn) playBtn.addEventListener('click', activate);

    // clicking the card body also plays, but not when reaching for a control
    card.addEventListener('click', (e) => {
      if (e.target.closest('.freq__play, .freq__vol, .freq__volrange, .freq__volbtn')) return;
      activate(e);
    });
  });

  /* ---------- first-gesture auto-start ----------
     Browsers block sound until the visitor interacts. On a returned
     visit (or after they pressed play before) we start the ambient
     bed on the very first click / key / scroll AND show the pause. */
  function armGesture() {
    const evs = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
    const once = () => {
      evs.forEach((ev) => window.removeEventListener(ev, once));
      if (state.kind === 'ambient' && state.paused) {
        resumeAmbient();
      } else if (state.kind === 'tone' && state.paused) {
        resumeTone();
      }
    };
    evs.forEach((ev) => window.addEventListener(ev, once, { passive: true, once: true }));
  }

  /* ---------- restore on load ---------- */
  function restore() {
    if (state.kind) {
      // We were playing when the visitor navigated away: browsers block audio
      // until a gesture, so show the dock as paused and resume on first touch.
      const wasPlaying = !state.paused;
      state.paused = true;
      if (state.kind === 'tone') stopTone(true);
      render();
      if (wasPlaying) armGesture();
      return;
    }
    render();
    // first visit: offer the ambient track gently
    setTimeout(showPrompt, 4200);
  }

  /* keep every page in sync if two tabs are open */
  window.addEventListener('storage', (e) => {
    if (e.key !== STORE) return;
    const next = readState();
    Object.assign(state, next);
    render();
  });

  restore();

  /* expose for other scripts (frequency page cards already wired) */
  window.SomaAudio = { startTone, stopTone, startAmbient, pauseAmbient, setVolume, toggle, TRACK };
})();
