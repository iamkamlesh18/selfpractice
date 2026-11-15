/* =========================================================
   SŌMA — frequencies page
   Category filters only. Playback and volume live in the shared
   audio engine (ambient.js), which owns the dock and keeps the
   current tone alive across pages.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$ } = window.Soma;

  const grid = $('#freqGrid');
  if (!grid) return;

  const cards = $$('.freq');
  const chips = $$('.freq-toolbar .chip');

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
})();
