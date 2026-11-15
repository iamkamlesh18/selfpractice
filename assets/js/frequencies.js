/* =========================================================
   SŌMA — healing frequency player
   One pure sine oscillator with a soft triangle companion,
   gentle attack/release so it never clicks.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$, AudioKit } = window.Soma;

  const grid = $('#freqGrid');
  if (!grid) return;

  const cards = $$('.freq');
  const player = $('#freqPlayer');
  const playerName = $('#playerName');
  const playerHz = $('#playerHz');
  const playerVol = $('#playerVol');
  const playerStop = $('#playerStop');
  const chips = $$('.freq-toolbar .chip');

  let active = null;      // { card, osc, osc2, gain }
  let volume = 0.35;      // 0..1 of a safe max

  const MAX_VOL = 0.22;   // keeps sine tones soft even at 100%

  function stop() {
    if (!active) return;
    const c = AudioKit.ctx;
    const { osc, osc2, gain, card } = active;
    const t = c.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setTargetAtTime(0.0001, t, 0.18);
    try { osc.stop(t + 1.2); osc2.stop(t + 1.2); } catch (e) { }
    card.classList.remove('is-playing');
    card.querySelector('.freq__play').innerHTML =
      '<svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg> Play';
    active = null;
    player.hidden = true;
  }

  function play(card) {
    const c = AudioKit.ensure();
    if (!c) return;
    AudioKit.resume();

    const hz = parseFloat(card.dataset.hz);
    const name = card.dataset.name;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume * MAX_VOL, c.currentTime + 1.2);
    gain.connect(AudioKit.master);

    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = hz;
    osc.connect(gain);

    // a quiet octave-up triangle adds body without harshness
    const osc2 = c.createOscillator();
    const g2 = c.createGain();
    g2.gain.value = 0.12;
    osc2.type = 'triangle';
    osc2.frequency.value = hz * 2;
    osc2.connect(g2).connect(gain);

    osc.start();
    osc2.start();

    active = { card, osc, osc2, gain };
    card.classList.add('is-playing');
    card.querySelector('.freq__play').innerHTML =
      '<svg viewBox="0 0 24 24" class="ico"><use href="#i-pause"></use></svg> Playing';

    player.hidden = false;
    playerName.textContent = name;
    playerHz.textContent = `${hz} Hz · ${card.querySelector('.freq__use').textContent}`;
  }

  function toggle(card) {
    if (active && active.card === card) { stop(); return; }
    stop();
    play(card);
  }

  cards.forEach((card) => {
    card.querySelector('.freq__play').addEventListener('click', (e) => {
      e.stopPropagation();
      toggle(card);
    });
    card.addEventListener('click', (e) => {
      if (e.target.closest('.freq__play')) return;
      toggle(card);
    });
  });

  playerStop.addEventListener('click', stop);

  playerVol.addEventListener('input', () => {
    volume = parseInt(playerVol.value, 10) / 100;
    if (active) {
      active.gain.gain.setTargetAtTime(volume * MAX_VOL, AudioKit.ctx.currentTime, 0.1);
    }
  });

  /* Filters */
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const f = chip.dataset.filter;
      cards.forEach((card) => {
        const hz = parseFloat(card.dataset.hz);
        const isSol = !!card.querySelector('.tag');
        let show = true;
        if (f === 'solfeggio') show = isSol;
        else if (f === 'healing') show = !isSol;
        else if (f === 'high') show = hz >= 500;
        else if (f === 'low') show = hz < 300;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
})();
