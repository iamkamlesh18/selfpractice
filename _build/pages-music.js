/* =========================================================
   builds music.html — a YouTube-style app.
   Left rail + search, a sticky in-page player with the video's
   own title/actions, every section laid out in full (nothing hidden),
   and a right rail holding the queue. Playback never leaves the page.
   ========================================================= */
const { page } = require('./shell');

const VIDEOS = require('./music-data.js');

const fmtLen = (label) => (label || '').toString();

/* ---------------------------------------------------------
   Card: YouTube grid card — thumbnail, duration, title, meta
   --------------------------------------------------------- */
const card = (v) => `
      <article class="vcard" data-song="${v.id}" data-cat="${v.cat || ''}"
        data-title="${v.title.replace(/"/g, '')}" data-author="${(v.author || '').replace(/"/g, '')}">
        <button class="vcard__thumb" data-video="${v.id}" aria-label="Play ${v.title.replace(/"/g, '')}">
          <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" />
          <span class="vcard__dur">${fmtLen(v.hours || v.len)}</span>
          <span class="vcard__hoverplay"><svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg></span>
        </button>
        <div class="vcard__meta">
          <h3>${v.title}</h3>
          <p class="vcard__by">${v.author || 'Sounds of Isha'}</p>
          ${v.note ? `<p class="vcard__note">${v.note}</p>` : ''}
        </div>
      </article>`;

/* compact rows used inside a section that shows many tracks */
const row = (v) => `
      <article class="vrow" data-song="${v.id}"
        data-title="${v.title.replace(/"/g, '')}" data-author="${(v.author || '').replace(/"/g, '')}">
        <button class="vrow__btn" data-video="${v.id}" aria-label="Play ${v.title.replace(/"/g, '')}">
          <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" />
          <span class="vrow__play"><svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg></span>
        </button>
        <div class="vrow__meta">
          <h4>${v.title}</h4>
          <p>${v.author || 'Sounds of Isha'}</p>
        </div>
        <span class="vrow__dur">${fmtLen(v.hours || v.len)}</span>
      </article>`;

const section = (o) => `
    <section class="yt-section" id="${o.id}" data-title="${o.title}">
      <div class="yt-section__head">
        <h2>${o.title}</h2>
        ${o.sub ? `<p>${o.sub}</p>` : ''}
      </div>
      <div class="${o.layout === 'rows' ? 'yt-rows' : 'yt-grid'}">
${o.items.map(o.layout === 'rows' ? row : card).join('\n')}
      </div>
    </section>`;

const SECTIONS = [
  {
    id: 'isha', title: 'Sounds of Isha', count: VIDEOS.isha.length, layout: 'rows',
    sub: 'Chants, stotrams and instrumental music from the Isha channel — plays in YouTube\u2019s own player, so views go to them.',
    items: VIDEOS.isha
  },
  {
    id: 'devotional', title: 'Devotional & bhajans', count: VIDEOS.devotional.length,
    sub: 'Marathi devotional, kirtan, film songs and shlokas from other artists.',
    items: VIDEOS.devotional
  },
  { id: 'shelf', title: 'Meditation shelf', count: VIDEOS.shelf.length, items: VIDEOS.shelf }
];

const CATS = [
  ['home', 'Home', 'i-sun'],
  ['isha', 'Sounds of Isha', 'i-lotus'],
  ['devotional', 'Devotional', 'i-flame'],
  ['shelf', 'Meditation shelf', 'i-leaf']
];

const total = SECTIONS.reduce((n, s) => n + s.count, 0);

const body = `
<!-- top bar -->
<a id="musicTop"></a>
<header class="ytbar">
  <button class="ytbar__burger" id="ytBurger" aria-label="Open menu" aria-expanded="false">
    <svg viewBox="0 0 24 24" class="ico"><use href="#i-menu"></use></svg>
  </button>
  <a class="ytbar__brand" href="music.html">
    <span class="ytbar__mark"><svg viewBox="0 0 48 48"><use href="#logo-mark"></use></svg></span>
    <span>Sōma<span class="ytbar__sub">Music</span></span>
  </a>
  <form class="ytbar__search" id="ytSearch" role="search" onsubmit="return false">
    <svg viewBox="0 0 24 24" class="ico"><use href="#i-search"></use></svg>
    <input id="ytSearchInput" type="search" placeholder="Search chants, artists, stotrams…" aria-label="Search music" autocomplete="off" />
    <button type="button" id="ytSearchClear" aria-label="Clear search" hidden>
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-close"></use></svg>
    </button>
  </form>
  <a class="ytbar__link" href="index.html">Back to Sōma</a>
</header>

<div class="yt-shell">
  <!-- left rail -->
  <nav class="ytrail" id="ytRail" aria-label="Music categories">
    <a class="ytrail__item is-active" href="#musicTop" data-cat="home">
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-sun"></use></svg><span>Home</span>
    </a>
${CATS.filter(([k]) => k !== 'home').map(([k, label, icon]) => `
    <a class="ytrail__item" href="#${k}" data-cat="${k}">
      <svg viewBox="0 0 24 24" class="ico"><use href="#${icon}"></use></svg><span>${label}</span>
      <small>${(SECTIONS.find((s) => s.id === k) || {}).count || ''}</small>
    </a>`).join('')}
    <div class="ytrail__divider"></div>
    <a class="ytrail__item" href="breathing.html">
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-wind"></use></svg><span>Breathing</span>
    </a>
    <a class="ytrail__item" href="journey.html">
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-heart"></use></svg><span>Your journey</span>
    </a>
    <div class="ytrail__foot">${total} tracks · all playable here</div>
  </nav>

  <!-- main -->
  <div class="ytmain" id="ytMain">
    <!-- sticky player -->
    <section class="ytplayer" id="ytPlayer" hidden>
      <div class="ytplayer__stage" id="ytStage">
        <div class="ytplayer__target" id="vplayerTarget"></div>
        <p class="ytplayer__error" id="vplayerError" hidden></p>
      </div>
      <div class="ytplayer__info">
        <h2 id="vplayerTitle">—</h2>
        <div class="ytplayer__byrow">
          <span id="vplayerBy">—</span>
          <button class="ytchip" id="vpQueue" aria-pressed="true">Add to queue</button>
        </div>
        <div class="ytplayer__row">
          <a class="ytlink" id="vplayerYT" href="#" target="_blank" rel="noopener noreferrer">
            <span class="ytlink__mark" aria-hidden="true">▶</span> Watch on YouTube
          </a>
          <button class="ytbtn" id="vpPip">
            <svg viewBox="0 0 24 24" class="ico"><use href="#i-pip"></use></svg><span>Picture in picture</span>
          </button>
          <button class="ytbtn" id="vpMin">
            <svg viewBox="0 0 24 24" class="ico"><use href="#i-minimize"></use></svg><span>Minimize</span>
          </button>
          <button class="ytbtn ytbtn--danger" id="vpStop">
            <svg viewBox="0 0 24 24" class="ico"><use href="#i-stop"></use></svg><span>Stop</span>
          </button>
        </div>
      </div>
    </section>

    <!-- nothing playing yet -->
    <section class="ytidle" id="ytIdle">
      <div class="ytidle__art"><svg viewBox="0 0 48 48"><use href="#logo-mark"></use></svg></div>
      <div>
        <h1>Listen, and let the noise settle.</h1>
        <p>Press any track below to play it right here. Every chant, stotram and bhajan on this page is available — nothing is hidden behind a “show more”.</p>
      </div>
    </section>

    <!-- sections -->
    <div id="ytSections">
${SECTIONS.map(section).join('\n')}
    </div>

    <p class="yt-empty" id="ytEmpty" hidden>No tracks match that search.</p>
  </div>

  <!-- right rail: queue -->
  <aside class="ytrail-right" id="ytQueue" aria-label="Queue">
    <div class="ytq__head">
      <h2>Queue</h2>
      <button class="ytq__clear" id="ytQueueClear" type="button">Clear</button>
    </div>
    <ol class="ytq" id="ytQueueList"></ol>
    <p class="ytq__empty" id="ytQueueEmpty">Tracks you play are added here, in order.</p>
  </aside>
</div>

<!-- mini player, when the full player is scrolled out of view -->
<div class="ytmini" id="ytMini" hidden>
  <button class="ytmini__main" id="ytMiniFocus" aria-label="Back to player">
    <img id="ytMiniArt" src="" alt="" />
    <span>
      <b id="ytMiniTitle">—</b>
      <small id="ytMiniBy">—</small>
    </span>
  </button>
  <button class="ytmini__btn" id="ytMiniStart" aria-label="Back to player" title="Show player">
    <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"></use></svg>
  </button>
  <button class="ytmini__btn" id="ytMiniStop" aria-label="Stop" title="Stop">
    <svg viewBox="0 0 24 24" class="ico"><use href="#i-stop"></use></svg>
  </button>
</div>`;

console.log(page({
  file: 'music.html',
  title: 'Music — YouTube-style — Sōma',
  desc: 'Every Sounds of Isha chant, devotional, bhajan and meditation track on one page — a full YouTube-style layout with categories, search, queue and an in-page player that never leaves the page.',
  page: 'music',
  body,
  scripts: ['assets/js/music.js'],
  layout: 'yt'
}));
