/* =========================================================
   SŌMA — music page, YouTube-style

   · One persistent player at the top of the feed. It stays put
     while it plays and the track list scrolls underneath it —
     the videos are never hidden behind it (the feed is padded).
   · Selecting another track swaps the video in the SAME iframe,
     so there is never a second audio source.
   · Never pauses on tab switch / minimise / scroll.
     YouTube's own controls do the transport work.
   · No search: what is on the page is the whole shelf.
   · Up next (right rail) + any track can be queued with +,
     with previous / next walking the list.
   · A small floating player appears if you scroll the player away.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$ } = window.Soma;

  const shell = $('.yt-shell');
  if (!shell) return;

  const API_SRC = 'https://www.youtube.com/iframe_api';
  const BAR_H = 64;

  /* ---------- elements ---------- */
  const playerEl = $('#ytPlayer');
  const idleEl = $('#ytIdle');
  const target = $('#vplayerTarget');
  const errEl = $('#vplayerError');
  const titleEl = $('#vplayerTitle');
  const byEl = $('#vplayerBy');
  const ytLink = $('#vplayerYT');
  const hintEl = $('#ytHint');
  const queueList = $('#ytQueueList');
  const queueEmpty = $('#ytQueueEmpty');
  const mini = $('#ytMini');
  const miniArt = $('#ytMiniArt');
  const miniTitle = $('#ytMiniTitle');
  const miniBy = $('#ytMiniBy');
  const scrim = $('#ytRailScrim');

  let yt = null;
  let ready = false;
  let apiPromise = null;
  let current = null;            // { id, title, author }

  const queue = [];              // [{ id, title, author }] — up next
  const queueIds = new Set();

  /* ---------- track lookup ---------- */
  const trackOf = (el) => ({
    id: el.dataset.song,
    title: el.dataset.title || 'Untitled',
    author: el.dataset.author || ''
  });

  function findTrack(id) {
    const el = $(`[data-song="${id}"]`);
    return el ? trackOf(el) : null;
  }

  function upNextOrder() {
    const ids = (window.SOMA_UPNEXT || []).filter((id) => findTrack(id));
    const rest = $$('[data-song]').map((el) => el.dataset.song);
    return ids.concat(rest.filter((id) => ids.indexOf(id) === -1));
  }

  function stepFrom(id, dir) {
    const order = upNextOrder();
    const i = order.indexOf(id);
    if (i === -1) return null;
    return order[(i + dir + order.length) % order.length] || null;
  }

  /* =========================================================
     1. IFrame API
     ========================================================= */
  function loadApi() {
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) return resolve();

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        resolve();
      };

      let settled = false;
      if (!document.querySelector(`script[src="${API_SRC}"]`)) {
        const s = document.createElement('script');
        s.src = API_SRC;
        s.async = true;
        s.onerror = () => { if (!settled) { settled = true; reject(new Error('api')); } };
        document.head.appendChild(s);
      }
      setTimeout(() => {
        if (settled) return;
        if (window.YT && window.YT.Player) { settled = true; resolve(); }
        else { settled = true; reject(new Error('timeout')); }
      }, 12000);
    }).catch((err) => {
      apiPromise = null;          // allow a retry on the next play
      throw err;
    });
    return apiPromise;
  }

  /* =========================================================
     2. Player
     ========================================================= */
  function mount() {
    const holder = document.createElement('div');
    holder.id = 'ytMount';
    holder.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:#000;overflow:hidden';
    target.innerHTML = '';
    target.appendChild(holder);
    return holder;
  }

  function buildPlayer(id) {
    // a previous API/iframe may have been destroyed by stopAll — start fresh
    if (yt && (!ready || !document.body.contains(yt.getIframe?.() || null))) {
      try { yt.destroy(); } catch (e) { /* already gone */ }
      yt = null;
      ready = false;
    }

    if (yt && ready) {
      // same instance, new video — this is what prevents double audio
      yt.loadVideoById(id);
      return;
    }

    yt = new window.YT.Player(mount(), {
      videoId: id,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        fs: 1,
        ...(window.location.origin && window.location.origin !== 'null'
          ? { origin: window.location.origin } : {})
      },
      events: {
        onReady: () => {
          ready = true;
          errEl.hidden = true;
          // YouTube sizes itself from the iframe on load — nudge it into place
          setTimeout(() => {
            try { yt.setSize(target.clientWidth, target.clientHeight); } catch (e) { /* older builds */ }
          }, 300);
          // player events shouldn't pause anything on tab switch
          const frame = target.querySelector('iframe');
          if (frame) frame.removeAttribute('tabindex');
        },
        onStateChange: (e) => {
          // roll on to the next track when one ends
          if (e.data === window.YT.PlayerState.ENDED) go(1);
        },
        onError: () => {
          errEl.hidden = false;
          errEl.textContent = 'This video cannot be played here. Use “Watch on YouTube”.';
        }
      }
    });
  }

  function playTrack(id, title, author) {
    if (!id) return;
    errEl.hidden = true;

    const same = current && current.id === id && ready;
    current = { id, title: title || 'Untitled', author: author || '' };

    titleEl.textContent = current.title;
    byEl.textContent = current.author || 'Sounds of Isha';
    ytLink.href = 'https://www.youtube.com/watch?v=' + id;
    miniArt.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    miniTitle.textContent = current.title;
    miniBy.textContent = current.author || 'Sounds of Isha';

    playerEl.classList.add('is-playing');
    if (idleEl) idleEl.hidden = true;
    if (ready) errEl.hidden = true;   // stale API warning while re-mounting
    mini.hidden = true;
    requestAnimationFrame(syncMini);
    if (hintEl) hintEl.textContent = 'Playing — keep browsing, it will not stop.';

    markPlaying();

    // Up next: a track you play leaves the queue, anything else stays.
    // If nothing was queued by hand, the following tracks are queued for you.
    if (queueIds.has(id)) {
      queueIds.delete(id);
      const i = queue.findIndex((t) => t.id === id);
      if (i !== -1) queue.splice(i, 1);
    } else if (!queue.length) {
      fillQueue(id);
    }
    renderQueue();

    if (same) {
      yt.playVideo();
      return;
    }

    loadApi()
      .then(() => {
        errEl.hidden = true;
        buildPlayer(id);
      })
      .catch(() => {
        errEl.hidden = false;
        errEl.textContent = 'The player could not load. Use “Watch on YouTube”.';
      });
  }

  /* put the tracks after `id` into Up next (so next/autoplay work) */
  function fillQueue(id, count = 6) {
    const order = upNextOrder();
    const start = order.indexOf(id);
    if (start === -1) return;
    for (let n = 1; n <= count; n++) {
      const t = findTrack(order[(start + n) % order.length]);
      if (t && t.id !== id) addToQueueSilently(t);
    }
  }

  function addToQueueSilently(track) {
    if (!track || !track.id || queueIds.has(track.id)) return;
    queueIds.add(track.id);
    queue.push(track);
  }

  function go(dir) {
    let next;
    if (dir > 0 && queue.length) {
      next = queue[0];
    } else {
      const fromId = current ? current.id : upNextOrder()[0];
      const id = stepFrom(fromId, dir);
      next = id ? findTrack(id) : null;
    }
    if (!next) return;
    if (queue.length) queueIds.delete(next.id);
    playTrack(next.id, next.title, next.author);
  }

  function stopAll() {
    if (yt) {
      try {
        if (typeof yt.stopVideo === 'function') yt.stopVideo();
        yt.destroy();
      } catch (e) { /* player already torn down */ }
    }
    yt = null;
    ready = false;
    current = null;
    target.innerHTML = '';
    errEl.hidden = true;
    if (idleEl) idleEl.hidden = false;
    titleEl.textContent = 'Nothing playing';
    byEl.textContent = 'Press play on any track';
    ytLink.href = '#';
    playerEl.classList.remove('is-playing');
    mini.hidden = true;
    if (hintEl) hintEl.textContent = `Your whole shelf — ${$$('[data-song]').length} tracks, nothing hidden.`;
    markPlaying();
  }

  /* highlight every card / row / queue item that is playing */
  function markPlaying() {
    const id = current && current.id;
    $$('[data-song]').forEach((el) => {
      el.classList.toggle('is-playing', !!id && el.dataset.song === id);
    });
    $$('#ytQueueList li').forEach((li) => {
      li.classList.toggle('is-current', !!id && li.dataset.song === id);
    });
  }

  /* =========================================================
     3. Up next
     ========================================================= */
  function renderQueue() {
    if (!queueList) return;
    queueList.innerHTML = queue.map((t) => `
      <li data-song="${t.id}" data-title="${t.title.replace(/"/g, '')}" data-author="${(t.author || '').replace(/"/g, '')}">
        <img src="https://i.ytimg.com/vi/${t.id}/mqdefault.jpg" alt="" loading="lazy" />
        <span class="ytq__text">
          <b>${t.title}</b>
          <small>${t.author || 'Sounds of Isha'}</small>
        </span>
        <button class="ytq__x" data-unqueue="${t.id}" aria-label="Remove ${t.title.replace(/"/g, '')} from queue" title="Remove">
          <svg viewBox="0 0 24 24"><use href="#i-close"></use></svg>
        </button>
      </li>`).join('');
    if (queueEmpty) queueEmpty.hidden = queue.length > 0;
    markPlaying();
  }

  function addToQueue(track) {
    addToQueueSilently(track);
    renderQueue();
  }

  function removeFromQueue(id) {
    const i = queue.findIndex((t) => t.id === id);
    if (i === -1) return;
    queue.splice(i, 1);
    queueIds.delete(id);
    renderQueue();
  }

  queueList?.addEventListener('click', (e) => {
    const x = e.target.closest('[data-unqueue]');
    if (x) {
      e.stopPropagation();
      removeFromQueue(x.dataset.unqueue);
      return;
    }
    const li = e.target.closest('li');
    if (!li) return;
    playTrack(li.dataset.song, li.dataset.title, li.dataset.author);
    backToPlayer();
  });

  $('#ytQueueClear')?.addEventListener('click', () => {
    queue.length = 0;
    queueIds.clear();
    renderQueue();
  });

  /* =========================================================
     4. Cards → play, + → queue
     ========================================================= */
  document.addEventListener('click', (e) => {
    const plus = e.target.closest('[data-queue]');
    if (plus) {
      e.preventDefault();
      const t = findTrack(plus.dataset.queue);
      if (t && !queueIds.has(t.id)) {
        addToQueue(t);
        plus.classList.add('is-done');
        setTimeout(() => plus.classList.remove('is-done'), 900);
      }
      return;
    }

    const btn = e.target.closest('[data-video]');
    if (btn) {
      const cardEl = btn.closest('[data-song]');
      const t = cardEl ? trackOf(cardEl) : { id: btn.dataset.video };
      playTrack(t.id, t.title, t.author);
      return;
    }

    // clicking the title area of a card also plays it
    const cardEl = e.target.closest('.vcard__meta, .vrow__meta');
    if (cardEl) {
      const parent = cardEl.closest('[data-song]');
      if (parent) {
        const t = trackOf(parent);
        playTrack(t.id, t.title, t.author);
      }
    }
  });

  $('#vpStop')?.addEventListener('click', stopAll);
  $('#vpNext')?.addEventListener('click', () => go(1));
  $('#vpPrev')?.addEventListener('click', () => go(-1));
  $('#ytMiniStop')?.addEventListener('click', stopAll);

  /* =========================================================
     5. Keep the player on screen, and a mini player after it
     ========================================================= */
  function barOffset() {
    const bar = $('.ytbar');
    return ((bar && bar.offsetHeight) || 62) + 12;
  }

  /* true when the player has been scrolled out of view */
  function playerOutOfView() {
    const r = playerEl.getBoundingClientRect();
    return r.bottom <= barOffset() + 4;
  }

  function backToPlayer() {
    const top = playerEl.getBoundingClientRect().top + window.scrollY - barOffset();
    window.scrollTo({ top, behavior: 'smooth' });
  }

  $('#ytMiniFocus')?.addEventListener('click', backToPlayer);
  $('#ytMiniStart')?.addEventListener('click', backToPlayer);

  /* the floating player shows only once the real one has scrolled up past
     the bar — checked on scroll/resize, so it survives the player resizing
     when a video mounts */
  function syncMini() {
    mini.hidden = !current || !playerOutOfView();
  }
  window.addEventListener('scroll', syncMini, { passive: true });
  window.addEventListener('resize', syncMini);

  /* =========================================================
     6. Left rail — drawer on small screens, active section
     ========================================================= */
  function railOpen(open) {
    shell.classList.toggle('is-rail-open', open);
    $('#ytBurger')?.setAttribute('aria-expanded', String(open));
    if (scrim) scrim.hidden = !open;
    document.body.classList.toggle('is-rail-drawer', open);
  }

  $('#ytBurger')?.addEventListener('click', () => {
    railOpen(!shell.classList.contains('is-rail-open'));
  });
  scrim?.addEventListener('click', () => railOpen(false));

  const railLinks = $$('.ytrail__item[data-cat]');
  const barLinks = $$('.ytbar__nav a[data-cat], .yt-chips .yt-chip[data-cat]');

  function setActive(cat) {
    railLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.cat === cat));
    barLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.cat === cat));
  }

  railLinks.forEach((a) => {
    a.addEventListener('click', () => {
      setActive(a.dataset.cat);
      railOpen(false);
    });
  });
  barLinks.forEach((a) => a.addEventListener('click', () => setActive(a.dataset.cat)));

  /* land on Home, like YouTube's front page */
  setActive('home');

  /* a section link must open the list at the top, not behind the player */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const targetEl = document.getElementById(id);
    if (!targetEl) return;
    e.preventDefault();
    const gap = playerEl.getBoundingClientRect().height + barOffset() + 16;
    const top = targetEl.getBoundingClientRect().top + window.scrollY - gap;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });

  const sections = $$('.yt-section');
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => spy.observe(s));
    const top = $('#musicTop');
    if (top) {
      const ioTop = new IntersectionObserver(([en]) => { if (en.isIntersecting) setActive('home'); },
        { rootMargin: `-${BAR_H}px 0px -80% 0px` });
      ioTop.observe(top);
    }
  }

  /* =========================================================
     7. Small polish
     ========================================================= */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') railOpen(false);
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight' && e.shiftKey && current) { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft' && e.shiftKey && current) { e.preventDefault(); go(-1); }
  });

  /* never pause on visibility change — music keeps playing.
     (Nothing is registered here, deliberately.) */

  /* lazy thumbnails: don't let YouTube images block the first paint */
  miniArt.loading = 'lazy';

  renderQueue();
})();
