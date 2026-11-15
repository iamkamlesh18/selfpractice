/* =========================================================
   SŌMA — music page
   Category filter + in-page YouTube player.

   The player is driven by the YouTube IFrame Player API, which is
   loaded lazily the first time a track is opened. That gives us real
   control: play/pause, seek, ±15s, volume, mute, speed, loop,
   subtitles, theatre size, fullscreen and a real title/author.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$ } = window.Soma;

  const grid = $('#trackGrid');
  if (!grid) return;

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
     2. Player
     ========================================================= */
  const player = $('#vplayer');
  const panel = $('#vplayerPanel');

  const target = $('#vplayerTarget');
  const loading = $('#vplayerLoading');
  const titleEl = $('#vplayerTitle');
  const byEl = $('#vplayerBy');
  const ytLink = $('#vplayerYT');
  const authorEl = $('#vplayerAuthor');
  const shareBtn = $('#vpShare');
  const shareLbl = $('#vpShareLabel');

  const btnPlay = $('#vpPlay');
  const btnBack = $('#vpBack');
  const btnFwd = $('#vpFwd');
  const btnMute = $('#vpMute');
  const btnLoop = $('#vpLoop');
  const btnCC = $('#vpCC');
  const btnFull = $('#vpFull');
  const btnTheatre = $('#vpTheatre');

  const timeEl = $('#vpTime');
  const seekEl = $('#vpSeek');
  const volEl = $('#vpVol');
  const speedEl = $('#vpSpeed');

  const API_SRC = 'https://www.youtube.com/iframe_api';

  let yt = null;            // the YT.Player instance
  let ready = false;
  let lastFocus = null;
  let tickId = null;
  let loopOn = false;
  let ccOn = false;
  let apiPromise = null;

  const fmt = (s) => {
    if (!Number.isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  /* ---------- lazy-load the IFrame API ---------- */
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

      // safety net in case the host blocks the API
      setTimeout(() => {
        if (window.YT && window.YT.Player) resolve();
        else reject(new Error('YouTube player did not initialise'));
      }, 12000);
    });
    return apiPromise;
  }

  function setPlayIcon(playing) {
    btnPlay.innerHTML = `<svg viewBox="0 0 24 24" class="ico"><use href="#${playing ? 'i-pause' : 'i-play'}"></use></svg>`;
    btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function setMuteIcon(muted) {
    btnMute.innerHTML = `<svg viewBox="0 0 24 24" class="ico"><use href="#${muted ? 'i-mute' : 'i-volume'}"></use></svg>`;
    btnMute.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    btnMute.classList.toggle('is-on', muted);
  }

  /* paint the gradient fill of a range track up to its current value */
  function paintSeek(pct) {
    const p = Math.max(0, Math.min(100, pct));
    seekEl.style.backgroundSize = `${p}% 100%, 100% 100%`;
  }

  function syncTime() {
    if (!ready || !yt || typeof yt.getCurrentTime !== 'function') return;
    const cur = yt.getCurrentTime() || 0;
    const dur = yt.getDuration() || 0;
    timeEl.textContent = `${fmt(cur)} / ${fmt(dur)}`;
    if (document.activeElement !== seekEl && dur > 0) {
      const pct = (cur / dur) * 100;
      seekEl.value = String(pct);
      paintSeek(pct);
    }
  }

  function startTicker() {
    stopTicker();
    tickId = setInterval(syncTime, 500);
  }
  function stopTicker() {
    if (tickId) clearInterval(tickId);
    tickId = null;
  }

  /* ---------- create / reuse the player ---------- */
  function createPlayer(id) {
    if (yt && ready) {
      yt.loadVideoById(id);
      return;
    }
    target.innerHTML = '<div id="vpYtMount"></div>';
    const mount = $('#vpYtMount');
    yt = new window.YT.Player(mount, {
      videoId: id,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          ready = true;
          loading.hidden = true;
          setPlayIcon(true);
          setMuteIcon(false);
          const v = Number(volEl.value);
          yt.setVolume(v);
          if (loopOn) yt.setLoop(true);
          paintSeek(0);
          syncTime();
          startTicker();
        },
        onStateChange: (e) => {
          const S = window.YT.PlayerState;
          if (e.data === S.PLAYING) { setPlayIcon(true); loading.hidden = true; }
          if (e.data === S.PAUSED) setPlayIcon(false);
          if (e.data === S.ENDED) {
            setPlayIcon(false);
            if (loopOn) { yt.seekTo(0); yt.playVideo(); }
          }
          if (e.data === S.BUFFERING) loading.hidden = false;
          if (e.data === S.PLAYING) syncTime();
        },
        onError: () => {
          loading.hidden = true;
          titleEl.textContent = 'This video cannot be played here';
          byEl.textContent = 'Use “Open on YouTube” — the creator may have disabled embedding.';
        }
      }
    });
  }

  /* ---------- open / close ---------- */
  function open(id, title, author) {
    lastFocus = document.activeElement;
    titleEl.textContent = title;
    byEl.textContent = author;
    ytLink.href = 'https://www.youtube.com/watch?v=' + id;
    if (authorEl) {
      const q = encodeURIComponent(author || '');
      authorEl.href = `https://www.youtube.com/results?search_query=${q}`;
    }
    player.hidden = false;
    document.body.classList.add('is-locked');
    loading.hidden = false;

    loadApi()
      .then(() => createPlayer(id))
      .catch(() => {
        loading.hidden = true;
        titleEl.textContent = 'Player unavailable';
        byEl.textContent = 'Open this track on YouTube instead.';
      });

    btnPlay.focus();
  }

  function close() {
    if (player.hidden) return;
    // stop playback so audio never continues behind a closed dialog
    if (yt && ready && typeof yt.stopVideo === 'function') yt.stopVideo();
    stopTicker();
    player.hidden = true;
    document.body.classList.remove('is-locked');
    panel.classList.remove('is-theatre');
    btnTheatre.classList.remove('is-on');
    btnTheatre.setAttribute('aria-pressed', 'false');
    if (document.fullscreenElement) document.exitFullscreen?.();
    lastFocus?.focus();
  }

  $$('.track__thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      open(btn.dataset.video, btn.dataset.title, btn.dataset.author);
    });
  });

  $$('[data-close]', player).forEach((el) => el.addEventListener('click', close));

  /* ---------- transport ---------- */
  btnPlay.addEventListener('click', () => {
    if (!ready) return;
    const S = window.YT.PlayerState;
    if (yt.getPlayerState() === S.PLAYING) yt.pauseVideo();
    else yt.playVideo();
  });

  btnBack.addEventListener('click', () => {
    if (!ready) return;
    yt.seekTo(Math.max(0, yt.getCurrentTime() - 15), true);
    syncTime();
  });

  btnFwd.addEventListener('click', () => {
    if (!ready) return;
    yt.seekTo(Math.min(yt.getDuration(), yt.getCurrentTime() + 15), true);
    syncTime();
  });

  seekEl.addEventListener('input', () => {
    paintSeek(Number(seekEl.value));
    if (!ready) return;
    const dur = yt.getDuration() || 0;
    const t = (Number(seekEl.value) / 100) * dur;
    timeEl.textContent = `${fmt(t)} / ${fmt(dur)}`;
  });
  seekEl.addEventListener('change', () => {
    if (!ready) return;
    const dur = yt.getDuration() || 0;
    yt.seekTo((Number(seekEl.value) / 100) * dur, true);
  });

  volEl.addEventListener('input', () => {
    if (!ready) return;
    const v = Number(volEl.value);
    yt.setVolume(v);
    if (v > 0 && yt.isMuted()) yt.unMute();
    setMuteIcon(v === 0 || yt.isMuted());
  });

  btnMute.addEventListener('click', () => {
    if (!ready) return;
    if (yt.isMuted()) { yt.unMute(); if (Number(volEl.value) === 0) { volEl.value = '60'; yt.setVolume(60); } }
    else yt.mute();
    setMuteIcon(yt.isMuted());
  });

  speedEl.addEventListener('change', () => {
    if (!ready) return;
    yt.setPlaybackRate(Number(speedEl.value));
  });

  btnLoop.addEventListener('click', () => {
    loopOn = !loopOn;
    btnLoop.classList.toggle('is-on', loopOn);
    btnLoop.setAttribute('aria-pressed', String(loopOn));
    if (!ready) return;
    yt.setLoop(loopOn);
    if (loopOn) yt.playVideo();
  });

  btnCC.addEventListener('click', () => {
    ccOn = !ccOn;
    btnCC.classList.toggle('is-on', ccOn);
    btnCC.setAttribute('aria-pressed', String(ccOn));
    if (!ready) return;
    // module is 0 when captions are off
    if (ccOn) yt.loadModule('captions');
    else yt.unloadModule('captions');
  });

  btnTheatre.addEventListener('click', () => {
    const on = panel.classList.toggle('is-theatre');
    btnTheatre.classList.toggle('is-on', on);
    btnTheatre.setAttribute('aria-pressed', String(on));
  });

  btnFull.addEventListener('click', () => {
    if (document.fullscreenElement) { document.exitFullscreen?.(); return; }
    panel.requestFullscreen?.().catch(() => { });
  });

  /* ---------- share ---------- */
  shareBtn.addEventListener('click', async () => {
    const url = ytLink.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        // deprecated but the only option in insecure contexts / older browsers
        // eslint-disable-next-line deprecation/deprecation
        document.execCommand('copy');
        ta.remove();
      }
      shareLbl.textContent = 'Copied!';
    } catch (e) {
      shareLbl.textContent = 'Copy failed';
    }
    setTimeout(() => { shareLbl.textContent = 'Copy link'; }, 1800);
  });

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', (e) => {
    if (player.hidden) return;

    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select';

    if (e.key === 'Escape') { close(); return; }
    if (typing) return;

    switch (e.key) {
      case ' ': e.preventDefault(); btnPlay.click(); break;
      case 'ArrowLeft': btnBack.click(); break;
      case 'ArrowRight': btnFwd.click(); break;
      case 'm': case 'M': btnMute.click(); break;
      case 'f': case 'F': btnFull.click(); break;
      case 't': case 'T': btnTheatre.click(); break;
      case 'l': case 'L': btnLoop.click(); break;
      default: break;
    }
  });

  /* stop audio when the tab goes away */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && ready && yt && typeof yt.pauseVideo === 'function') {
      yt.pauseVideo();
    }
  });
})();
