/* =========================================================
   SŌMA — chakra meditation
   Colour + yantra + frequency + per-chakra timer.
   Reads window.SOMA_CHAKRAS injected by the page.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$, AudioKit } = window.Soma;
  const DATA = window.SOMA_CHAKRAS || [];
  if (!DATA.length) return;

  const stage = $('#chakraStage');
  const art = $('#ckArt');
  const items = $$('.chakra-item');
  const chips = $$('.chakra-timer__chips .chip');
  const ring = $('#ckRing');
  const timeEl = $('#ckTime');
  const go = $('#ckGo');
  const goLabel = $('#ckGoLabel');
  const goIcon = $('#ckGoIcon');
  const liveEl = $('#ckLive');
  const noteLive = $('#ckNoteLive');
  const toneBtn = $('#ckTone');

  const CIRC = 2 * Math.PI * 27;
  ring.style.strokeDasharray = CIRC.toFixed(2);

  let current = DATA[0];
  let minutes = 5;
  let left = minutes * 60;
  let running = false;
  let tick = null;
  let tone = null;   // { osc, gain }

  /* ---------- painting ---------- */
  function paint(c) {
    current = c;
    stage.style.setProperty('--cc', c.color);
    stage.style.setProperty('--c2', c.dark);
    $('#ckSk').textContent = `${c.name} · ${c.n}`;
    $('#ckTitle').innerHTML = `${c.en.replace(' Chakra', '')} <em>Chakra</em>`;
    const el = $('#ckElement');
    el.textContent = c.element;
    el.style.cssText = `color:${c.color};border-color:${c.color}55;background:${c.color}1a`;
    $('#ckBody').textContent = c.body;
    $('#ckHz').textContent = `${c.freq} Hz`;
    $('#ckNote').textContent = `${c.note} · ${c.seed}`;
    $('#ckRegion').textContent = c.region;
    $('#ckBalanced').textContent = c.balanced;
    $('#ckImbalance').textContent = c.imbalance;

    art.classList.remove('is-spinning');
    void art.offsetWidth;
    art.classList.add('is-spinning');
    const svg = art.querySelector('svg');
    if (svg) svg.outerHTML = svgPCB(c);
  }

  /* rebuilds the yantra svg for a chakra (kept in sync with the build script) */
  function svgPCB(c) {
    const count = c.petals >= 1000 ? 24 : c.petals;
    const r = c.petals >= 1000 ? 62 : c.petals >= 12 ? 64 : 58;
    let p = '';
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const x = 100 + Math.cos(a) * r;
      const y = 100 + Math.sin(a) * r;
      const rot = (a * 180) / Math.PI + 90;
      p += `<ellipse class="petal" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="11" ry="20" transform="rotate(${rot.toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})"/>`;
    }
    return `<svg viewBox="0 0 200 200" role="img" aria-label="${c.en} yantra">
      <circle class="petal" cx="100" cy="100" r="86" fill="none" opacity=".35"/>
      ${p}
      <circle class="petal" cx="100" cy="100" r="36" fill="none"/>
      <path class="petal" d="M100 62 118 132 82 132Z" fill="none"/>
      <path class="petal" d="M100 138 82 68 118 68Z" fill="none" opacity=".6"/>
      <circle class="core" cx="100" cy="100" r="26"/>
      <text x="100" y="110" text-anchor="middle" class="glyph-text" style="font-size:26px">${c.seed}</text>
    </svg>`;
  }

  /* ---------- tone ---------- */
  function startTone() {
    if (tone) return;
    const ctx = AudioKit.ensure();
    if (!ctx) return;
    AudioKit.resume();
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.13, ctx.currentTime + 1.4);
    g.connect(AudioKit.master);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = current.freq;
    osc.connect(g);
    osc.start();

    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    g2.gain.value = 0.1;
    osc2.type = 'triangle';
    osc2.frequency.value = current.freq * 2;
    osc2.connect(g2).connect(g);
    osc2.start();

    tone = { osc, osc2, gain: g };
    noteLive.classList.add('is-live');
    toneBtn.textContent = 'Stop tone';
  }

  function stopTone() {
    if (!tone) return;
    const ctx = AudioKit.ctx;
    const t = ctx.currentTime;
    tone.gain.gain.cancelScheduledValues(t);
    tone.gain.gain.setTargetAtTime(0.0001, t, 0.2);
    try { tone.osc.stop(t + 1.5); tone.osc2.stop(t + 1.5); } catch (e) {}
    tone = null;
    noteLive.classList.remove('is-live');
    toneBtn.textContent = 'Play tone only';
  }

  function retuneTone() {
    if (!tone) return;
    const ctx = AudioKit.ctx;
    const t = ctx.currentTime;
    tone.osc.frequency.setTargetAtTime(current.freq, t, 0.4);
    tone.osc2.frequency.setTargetAtTime(current.freq * 2, t, 0.4);
  }

  /* ---------- timer ---------- */
  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function paintTimer() {
    timeEl.textContent = fmt(left);
    const ratio = 1 - left / (minutes * 60);
    ring.style.strokeDashoffset = (CIRC * ratio).toFixed(2);
  }

  function setRunning(v) {
    running = v;
    goIcon.setAttribute('href', v ? '#i-pause' : '#i-play');
    goLabel.textContent = v ? 'Pause' : (left === minutes * 60 ? 'Begin' : 'Resume');
    if (v) {
      startTone();
      AudioKit.tone(current.freq * 2, 2.5, 0.1);
      tick = setInterval(() => {
        left--;
        if (left <= 0) {
          left = 0;
          paintTimer();
          clearInterval(tick);
          running = false;
          setRunning(false);
          timeEl.textContent = 'done';
          [1, 2, 3].forEach((k) => setTimeout(() => AudioKit.tone(current.freq, 4, 0.12), k * 900));
          setTimeout(() => { left = minutes * 60; paintTimer(); goLabel.textContent = 'Begin'; }, 6000);
          return;
        }
        paintTimer();
      }, 1000);
    } else {
      clearInterval(tick);
      stopTone();
    }
    paintTimer();
  }

  /* ---------- wiring ---------- */
  items.forEach((btn) => {
    btn.addEventListener('click', () => {
      items.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      const c = DATA.find((d) => d.key === btn.dataset.chakra);
      if (!c) return;
      const wasRunning = running;
      paint(c);
      retuneTone();
      if (wasRunning) { /* keep the timer, new tone */ }
      liveEl.textContent = running ? `Tone ${c.freq} Hz · timer running` : 'Tone off · timer idle';
    });
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      minutes = parseInt(chip.dataset.min, 10);
      clearInterval(tick);
      running = false;
      goIcon.setAttribute('href', '#i-play');
      goLabel.textContent = 'Begin';
      left = minutes * 60;
      paintTimer();
    });
  });

  go.addEventListener('click', () => {
    if (left === 0) left = minutes * 60;
    setRunning(!running);
    liveEl.textContent = running ? `Tone ${current.freq} Hz · timer running` : 'Tone off · timer idle';
  });

  toneBtn.addEventListener('click', () => {
    if (tone) { stopTone(); liveEl.textContent = running ? 'Timer running · tone paused' : 'Tone off · timer idle'; }
    else { startTone(); liveEl.textContent = `Tone ${current.freq} Hz · timer ${running ? 'running' : 'idle'}`; }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running) setRunning(false);
  });

  paint(DATA[0]);
  liveEl.textContent = 'Tone off · timer idle';
  paintTimer();
})();
