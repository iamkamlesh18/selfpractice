/* =========================================================
   SŌMA — yoga page interactions
   Keeps the sticky sub-nav in sync with the section you are
   reading. (Pranayama sound previews live in pranayama.js,
   loaded by breathing.html.)
   ========================================================= */
(() => {
  'use strict';

  const { $$ } = window.Soma;

  const links = $$('.subnav a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const map = new Map();
  links.forEach((a) => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) map.set(el, a);
  });
  if (!map.size) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.remove('is-current'));
        map.get(e.target)?.classList.add('is-current');
      }
    });
  }, { rootMargin: '-30% 0px -55% 0px' });

  map.forEach((_, el) => io.observe(el));
})();
