/* =========================================================
   SŌMA — music page
   Category filter + in-page YouTube theatre.

   Playback rules (deliberate):
     · NEVER pauses because the tab is hidden, minimized or switched.
     · Never pauses because the theatre is closed — use minimise
       (dock) or close-and-stop explicitly.
     · YouTube's own player supplies every transport control, so the
       toolbar here only holds what YouTube cannot: picture-in-picture,
       minimise, close and a real "watch on YouTube" link.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$ } = window.Soma;

  const grid = $('#trackGrid');
  if (!grid) return;

  const API_SRC = 'https://www.youtube.com/iframe_api';

  /* =========================================================
     1. Category filtering
     ========================================================= */
  const chips = $$('.track-filters .chip');
  const tracks = $$('.track');
  const empty = $('#trackEmpty');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const f = chip.dataset.filter;

      // "Sounds of Isha" has its own section rather than cards in this grid
      if (f === 'isha') {
        document.getElementById('isha')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      let shown = 0;
      tracks.forEach((t) => {
        const match = f === 'all' || t.dataset.cat === f;
        t.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  });

  /* =========================================================
     2. Elements
     ========================================================= */
  const player = $('#vplayer');
  const target = $('#vplayerTarget');
  const loading = $('#vplayerLoading');
  const titleEl = $('#vplayerTitle');
  const byEl = $('#vplayerBy');
  const ytLink = $('#vplayerYT');
  const btnPip = $('#vpPip');
  const btnMin = $('#vpMin');

  let yt = null;              // YT.Player instance
  let ready = false;
  let lastFocus = null;
  let apiPromise = null;
  let currentId = null;       // track currently loaded, so we can restore it
  let wasPlaying = false;     // last known state, for re-opening

  /* =========================================================
     3. Load the IFrame API once, lazily
     ========================================================= */
  function loadApi() {
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) { resolve(); return; }

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        resolve();
      };

      if (!document.querySelector(`script[src="${API_SRC}"]`)) {
        const s = document.createElement('script');
        s.src = API_SRC;
        s.async = true;
        s.onerror = () => reject(new Error('Could not load the YouTube player'));
        document.head.appendChild(s);
      }

      setTimeout(() => {
        if (window.YT && window.YT.Player) resolve();
        else reject(new Error('YouTube player did not initialise'));
      }, 12000);
    });
    return apiPromise;
  }

  /* =========================================================
     4. Create / re-target the player
     ========================================================= */
  function createPlayer(id) {
    if (yt && ready) {
      // we only get the src once, so clear it to be sure autoplay starts
      yt.loadVideoById(id);
      return;
    }

    // Build the mount fresh each time the theatre is re-opened so the iframe
    // is re-attached and YouTube autoplays without a second click.
    target.innerHTML = '<div id="vpYtMount"></div>';
    const mount = $('#vpYtMount');

    yt = new window.YT.Player(mount, {
      videoId: id,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        fs: 1,                 // YouTube's own fullscreen button
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          ready = true;
          loading.hidden = true;
          currentId = id;
          // continue where the last session left off
          if (wasPlaying) yt.playVideo();
        },
        onStateChange: (e) => {
          const S = window.YT.PlayerState;
          if (e.data === S.PLAYING) {
            wasPlaying = true;
            loading.hidden = true;
            document.body.classList.add('is-playing-media');
          }
          if (e.data === S.PAUSED) {
            wasPlaying = false;
            document.body.classList.remove('is-playing-media');
          }
          if (e.data === S.ENDED) {
            wasPlaying = false;
            document.body.classList.remove('is-playing-media');
          }
          if (e.data === S.BUFFERING) loading.hidden = false;
        },
        onError: () => {
          loading.hidden = true;
          titleEl.textContent = 'This video cannot be played here';
          byEl.textContent = 'Use “Watch on YouTube” \u2014 the creator may have disabled embedding.';
        }
      }
    });
  }

  /* =========================================================
     5. Open / minimise / close
     ========================================================= */
  function open(id, title, author) {
    lastFocus = document.activeElement;
    titleEl.textContent = title;
    byEl.textContent = author;
    currentId = id;
    ytLink.href = 'https://www.youtube.com/watch?v=' + id;

    player.hidden = false;
    document.body.classList.add('is-locked');
    loading.hidden = false;

    loadApi()
      .then(() => createPlayer(id))
      .catch(() => {
        loading.hidden = true;
        titleEl.textContent = 'Player unavailable';
        byEl.textContent = 'Watch this track on YouTube instead.';
      });

    $('#vpMin')?.focus();
  }

  /* Minimise: hide the theatre but keep playing. While minimised the video
     stays in the DOM (off-screen), so audio continues exactly as before. */
  function minimise() {
    if (player.hidden) return;
    player.classList.add('is-minimised');
    document.body.classList.remove('is-locked');
    player.classList.remove('is-hidden-media');
    lastFocus?.focus();
  }

  /* Close: hide the theatre AND stop the audio. */
  function close() {
    if (player.hidden) return;
    if (ready && typeof yt.stopVideo === 'function') yt.stopVideo();
    wasPlaying = false;
    player.hidden = true;
    player.classList.remove('is-minimised');
    document.body.classList.remove('is-locked');
    document.body.classList.remove('is-playing-media');
    if (document.fullscreenElement) document.exitFullscreen?.();
    lastFocus?.focus();
  }

  /* =========================================================
     6. Wiring
     ========================================================= */
  $$('.track__thumb, .isha-card__thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      open(btn.dataset.video, btn.dataset.title, btn.dataset.author);
    });
  });

  $$('[data-close]', player).forEach((el) => el.addEventListener('click', close));
  btnMin?.addEventListener('click', minimise);

  /* Picture-in-picture, when the browser exposes it via the iframe */
  btnPip?.addEventListener('click', async () => {
    try {
      const frame = target.querySelector('iframe');
      if (!frame) return;
      // same-origin restrictions mean the inner video element is not reachable;
      // fall back to the player's own PiP affordance if present
      if (document.pictureInPictureEnabled && frame.requestPictureInPicture) {
        await frame.requestPictureInPicture();
      }
    } catch (e) {
      /* PiP is not guaranteed — silently ignore */
    }
  });

  /* reopen a minimised theatre by clicking the title bar it leaves behind */
  player.addEventListener('click', (e) => {
    if (player.classList.contains('is-minimised') && e.target.closest('.vplayer__panel')) {
      player.classList.remove('is-minimised');
      document.body.classList.add('is-locked');
    }
  });

  /* Esc closes while the theatre is open */
  document.addEventListener('keydown', (e) => {
    if (player.hidden) return;
    if (e.key === 'Escape') {
      if (player.classList.contains('is-minimised')) close();
      else close();
    }
  });

  /* IMPORTANT: playback is never paused on visibilitychange.
     Nothing here listens for the tab going away, so music keeps playing when
     the tab is hidden, minimized or switched. */
})();
