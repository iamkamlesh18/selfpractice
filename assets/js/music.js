/* =========================================================
   SŌMA — music page
   Category filter + in-page YouTube player (privacy-enhanced
   embed, loaded only when a track is chosen).
   ========================================================= */
(() => {
  'use strict';

  const { $, $$ } = window.Soma;

  const grid = $('#trackGrid');
  if (!grid) return;

  const chips = $$('.track-filters .chip');
  const tracks = $$('.track');
  const empty = $('#trackEmpty');

  /* ---------- filtering ---------- */
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const f = chip.dataset.filter;
      let shown = 0;
      tracks.forEach((t) => {
        const match = f === 'all' || t.dataset.cat === f;
        t.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  });

  /* ---------- in-page player ---------- */
  const player = $('#vplayer');
  const frame = $('#vplayerFrame');
  const titleEl = $('#vplayerTitle');
  const byEl = $('#vplayerBy');
  const ytLink = $('#vplayerYT');
  let lastFocus = null;

  function open(id, title, author) {
    lastFocus = document.activeElement;
    titleEl.textContent = title;
    byEl.textContent = author;
    ytLink.href = 'https://www.youtube.com/watch?v=' + id;
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    player.hidden = false;
    document.body.classList.add('is-locked');
    $('.vplayer .btn--icon', player)?.focus();
  }

  function close() {
    if (player.hidden) return;
    player.hidden = true;
    frame.src = 'about:blank';
    document.body.classList.remove('is-locked');
    lastFocus?.focus();
  }

  $$('.track__thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      open(btn.dataset.video, btn.dataset.title, btn.dataset.author);
    });
  });

  $$('[data-close]', player).forEach((el) => el.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();
