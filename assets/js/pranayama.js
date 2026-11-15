/* =========================================================
   SŌMA — pranayama sound previews
   Loaded by breathing.html. Each "Hear" button synthesises a
   short demo of the practice so you can feel the pace before
   you try it.
   ========================================================= */
(() => {
  'use strict';

  const { $$, AudioKit } = window.Soma;

  const DEMOS = {
    /* 16 sharp belly-punch exhalations, twice */
    kapalbhati() {
      const c = AudioKit.ensure();
      if (!c) return 0;
      AudioKit.resume();
      const t0 = c.currentTime + 0.05;
      const beat = 0.42;
      for (let round = 0; round < 2; round++) {
        for (let i = 0; i < 16; i++) {
          const t = t0 + round * (16 * beat + 1.2) + i * beat;
          const o = c.createOscillator();
          const g = c.createGain();
          const f = c.createBiquadFilter();
          f.type = 'bandpass';
          f.frequency.value = 700 + Math.random() * 200;
          f.Q.value = 2.5;
          o.type = 'triangle';
          o.frequency.setValueAtTime(140, t);
          o.frequency.exponentialRampToValueAtTime(70, t + 0.09);
          g.gain.setValueAtTime(0.14, t);
          g.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
          o.connect(f).connect(g).connect(AudioKit.master);
          o.start(t);
          o.stop(t + 0.18);
        }
      }
      return 2 * (16 * beat + 1.2);
    },

    /* three long bee-like hums with formant filtering */
    bhramari() {
      const c = AudioKit.ensure();
      if (!c) return 0;
      AudioKit.resume();
      const t0 = c.currentTime + 0.05;
      const per = 7;
      for (let i = 0; i < 3; i++) {
        const t = t0 + i * per;
        const o = c.createOscillator();
        const g = c.createGain();
        const f1 = c.createBiquadFilter();
        const f2 = c.createBiquadFilter();
        f1.type = 'bandpass'; f1.frequency.value = 260; f1.Q.value = 7;
        f2.type = 'bandpass'; f2.frequency.value = 1250; f2.Q.value = 9;
        o.type = 'sawtooth';
        o.frequency.value = 118;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05, t + 1.4);
        g.gain.linearRampToValueAtTime(0.035, t + 4.6);
        g.gain.linearRampToValueAtTime(0, t + 5.6);
        o.connect(f1).connect(g);
        o.connect(f2).connect(g);
        g.connect(AudioKit.master);
        o.start(t);
        o.stop(t + 5.7);
      }
      return 3 * per;
    },

    /* ten strong, even in/out breath pairs */
    bhastrika() {
      const c = AudioKit.ensure();
      if (!c) return 0;
      AudioKit.resume();
      const base = c.currentTime + 0.1;
      const half = 0.5;
      let t = 0;
      for (let i = 0; i < 10; i++) {
        const start = base + t;
        [1, -1].forEach((dir, k) => {
          const o = c.createOscillator();
          const g = c.createGain();
          const at = start + k * half;
          o.type = 'sine';
          o.frequency.setValueAtTime(dir > 0 ? 200 : 260, at);
          o.frequency.linearRampToValueAtTime(dir > 0 ? 280 : 170, at + half);
          g.gain.setValueAtTime(0, at);
          g.gain.linearRampToValueAtTime(0.055, at + 0.08);
          g.gain.linearRampToValueAtTime(0, at + half);
          o.connect(g).connect(AudioKit.master);
          o.start(at);
          o.stop(at + half + 0.02);
        });
        t += half * 2;
      }
      return t;
    }
  };

  const LABEL = {
    kapalbhati: 'Hear rhythm',
    bhramari: 'Hear tone',
    bhastrika: 'Hear rhythm'
  };

  let stopTimer = null;

  function setButton(btn, playing) {
    const label = LABEL[btn.dataset.rhythm] || 'Hear';
    btn.classList.toggle('is-on', playing);
    btn.setAttribute('aria-pressed', String(playing));
    btn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" class="ico"><use href="#i-stop"></use></svg> Playing\u2026'
      : '<svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg> ' + label;
  }

  const buttons = $$('.prana__play');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    setButton(btn, false);
    btn.addEventListener('click', () => {
      clearTimeout(stopTimer);
      const wasOn = btn.classList.contains('is-on');
      buttons.forEach((b) => setButton(b, false));
      if (wasOn) return;

      const dur = DEMOS[btn.dataset.rhythm] ? DEMOS[btn.dataset.rhythm]() : 0;
      if (!dur) return;
      setButton(btn, true);
      stopTimer = setTimeout(() => setButton(btn, false), dur * 1000 + 300);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) buttons.forEach((b) => setButton(b, false));
  });
})();
