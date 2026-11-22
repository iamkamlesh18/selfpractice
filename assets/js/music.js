/* =========================================================
   SŌMA — music page, YouTube-style

   · One persistent player, mounted in-page; selecting another track
     swaps the video in the SAME iframe (no second audio source).
   · Never pauses on tab switch / minimize / scroll.
   · YouTube's own controls do all the transport work.
   · Search filters every card and row live.
   · Queue in the right rail; mini player appears when you scroll past.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$ } = window.Soma;

  const root = $('.yt-shell');
  if (!root) return;

  const API_SRC = 'https://www.youtube.com/iframe_api';

  /* ---------- elements ---------- */
  const playerEl = $('#ytPlayer');
  const idleEl = $('#ytIdle');
  const stageEl = $('#ytStage');
  const target = $('#vplayerTarget');
  const errEl = $('#vplayerError');
  const titleEl = $('#vplayerTitle');
  const byEl = $('#vplayerBy');
  const ytLink = $('#vplayerYT');
  const queueBtn = $('#vpQueue');
  const queueList = $('#ytQueueList');
  const queueEmpty = $('#ytQueueEmpty');
  const mini = $('#ytMini');
  const miniArt = $('#ytMiniArt');
  const miniTitle = $('#ytMiniTitle');
  const miniBy = $('#ytMiniBy');
  const searchInput = $('#ytSearchInput');
  const searchClear = $('#ytSearchClear');
  const emptyMsg = $('#ytEmpty');
  const rail = $('#ytRail');

  let yt = null;
  let ready = false;
  let apiPromise = null;
  let current = null;          // { id, title, author }
  let wasPlaying = false;
  let userStopped = false;

  const queue = [];            // [{ id, title, author }]
  const queueIds = new Set();

  const allCards = () => $$('.vcard, .vrow');

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

      if (!document.querySelector(`script[src="${API_SRC}"]`)) {
        const s = document.createElement('script');
        s.src = API_SRC;
        s.async = true;
        s.onerror = () => reject(new Error('api'));
        document.head.appendChild(s);
      }
      setTimeout(() => {
        if (window.YT && window.YT.Player) resolve();
        else reject(new Error('timeout'));
      }, 12000);
    });
    return apiPromise;
  }

  /* =========================================================
     2. Player
     ========================================================= */
  function buildPlayer(id) {
    if (yt && ready) {
      // same instance, new video — this is what prevents double audio
      yt.loadVideoById(id);
      return;
    }

    target.innerHTML = '<div id="ytMount"></div>';
    yt = new window.YT.Player($('#ytMount'), {
      videoId: id,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        fs: 1,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          ready = true;
          errEl.hidden = true;
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
    current = { id, title, author };
    wasPlaying = true;
    userStopped = false;

    titleEl.textContent = title || 'Now playing';
    byEl.textContent = author || '';
    ytLink.href = 'https://www.youtube.com/watch?v=' + id;
    miniArt.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    miniTitle.textContent = title || '';
    miniBy.textContent = author || '';

    playerEl.hidden = false;
    idleEl.hidden = true;

    markPlaying();
    addToQueue({ id, title, author });

    if (same) {
      yt.playVideo();
      return;
    }

    loadApi()
      .then(() => buildPlayer(id))
      .catch(() => {
        errEl.hidden = false;
        errEl.textContent = 'The player could not load. Use “Watch on YouTube”.';
      });
  }

  function stopAll() {
    userStopped = true;
    wasPlaying = false;
    if (ready && yt && typeof yt.stopVideo === 'function') yt.stopVideo();
    playerEl.hidden = true;
    idleEl.hidden = false;
    mini.hidden = true;
    current = null;
    markPlaying();
  }

  /* highlight the card / row that is playing */
  function markPlaying() {
    const id = current && current.id;
    allCards().forEach((el) => {
      el.classList.toggle('is-playing', !!id && el.dataset.song === id);
    });
    $$('#ytQueueList li').forEach((li) => {
      li.classList.toggle('is-current', !!id && li.dataset.song === id);
    });
  }

  /* =========================================================
     3. Queue
     ========================================================= */
  function addToQueue(track) {
    if (!track || !track.id || queueIds.has(track.id)) return;
    queueIds.add(track.id);
    queue.push(track);
    renderQueue();
  }

  function renderQueue() {
    if (!queueList) return;
    queueList.innerHTML = queue.map((t) => `
      <li data-song="${t.id}" data-title="${t.title.replace(/"/g, '')}" data-author="${(t.author || '').replace(/"/g, '')}">
        <img src="https://i.ytimg.com/vi/${t.id}/mqdefault.jpg" alt="" loading="lazy" />
        <span class="ytq__text">
          <b>${t.title}</b>
          <small>${t.author || ''}</small>
        </span>
      </li>`).join('');
    if (queueEmpty) queueEmpty.hidden = queue.length > 0;
    markPlaying();
  }

  queueList?.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    playTrack(li.dataset.song, li.dataset.title, li.dataset.author);
    playerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('#ytQueueClear')?.addEventListener('click', () => {
    queue.length = 0;
    queueIds.clear();
    renderQueue();
  });

  queueBtn?.addEventListener('click', () => {
    const on = queueBtn.getAttribute('aria-pressed') !== 'true';
    queueBtn.setAttribute('aria-pressed', String(on));
    $('#ytQueue').style.display = on ? '' : 'none';
  });

  /* =========================================================
     4. Cards → play
     ========================================================= */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-video]');
    if (btn) {
      const cardEl = btn.closest('[data-song]');
      const title = cardEl ? cardEl.dataset.title : '';
      const author = cardEl ? cardEl.dataset.author : '';
      playTrack(btn.dataset.video, title, author);
      return;
    }

    // clicking the title area of a card also plays it
    const cardEl = e.target.closest('.vcard__meta, .vrow__meta');
    if (cardEl) {
      const parent = cardEl.closest('[data-song]');
      if (parent) playTrack(parent.dataset.song, parent.dataset.title, parent.dataset.author);
    }
  });

  $('#vpStop')?.addEventListener('click', stopAll);
  $('#ytMiniStop')?.addEventListener('click', stopAll);

  /* =========================================================
     5. Minimise / picture-in-picture / mini bar
     ========================================================= */
  $('#vpMin')?.addEventListener('click', () => {
    // scroll the player out of the way; the mini bar keeps it reachable
    window.scrollTo({ top: playerEl.offsetTop + playerEl.offsetHeight, behavior: 'smooth' });
  });

  $('#vpPip')?.addEventListener('click', async () => {
    try {
      const frame = target.querySelector('iframe');
      if (frame && document.pictureInPictureEnabled && frame.requestPictureInPicture) {
        await frame.requestPictureInPicture();
      }
    } catch (err) { /* not every browser allows this */ }
  });

  $('#ytMiniFocus')?.addEventListener('click', () => {
    playerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#ytMiniStart')?.addEventListener('click', () => {
    playerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* show the mini bar once the real player is scrolled above the fold */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      mini.hidden = entry.isIntersecting || playerEl.hidden || !current;
    }, { rootMargin: '-70px 0px 0px 0px' });
    io.observe(playerEl);
  }

  /* =========================================================
     6. Search
     ========================================================= */
  function applySearch(q) {
    const needle = q.trim().toLowerCase();
    let shown = 0;

    $$('.yt-section').forEach((sec) => {
      let visibleInSection = 0;
      $$('.vcard, .vrow', sec).forEach((item) => {
        const hay = (item.dataset.title + ' ' + item.dataset.author + ' ' + item.textContent).toLowerCase();
        const match = !needle || hay.includes(needle);
        item.hidden = !match;
        if (match) visibleInSection++;
      });
      sec.hidden = visibleInSection === 0;
      shown += visibleInSection;
    });

    if (emptyMsg) emptyMsg.hidden = shown !== 0;
    if (searchClear) searchClear.hidden = !needle;
  }

  searchInput?.addEventListener('input', () => applySearch(searchInput.value));
  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    applySearch('');
    searchInput.focus();
  });
  $('#ytSearch')?.addEventListener('submit', (e) => e.preventDefault());

  /* =========================================================
     7. Left rail: active state + drawer toggle
     ========================================================= */
  $('#ytBurger')?.addEventListener('click', () => {
    const open = root.classList.toggle('is-rail-open');
    $('#ytBurger').setAttribute('aria-expanded', String(open));
  });

  $$('.ytrail__item[data-cat]').forEach((a) => {
    a.addEventListener('click', () => {
      $$('.ytrail__item').forEach((x) => x.classList.remove('is-active'));
      a.classList.add('is-active');
      root.classList.remove('is-rail-open');
    });
  });

  /* =========================================================
     8. Small polish
     ========================================================= */
  // Esc clears a search that is running
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchInput && document.activeElement === searchInput) {
      searchInput.value = '';
      applySearch('');
      searchInput.blur();
    }
  });

  // never pause on visibility change — music keeps playing.
  // (Nothing is registered here, deliberately.)

  renderQueue();
})();
