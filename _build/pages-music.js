/* =========================================================
   builds music.html — a YouTube-style music app.

   Layout (exactly like YouTube, no search box):
     · its own fixed top bar — the site's global nav is not
       rendered on this page, so nothing ever overlaps it
     · a left rail with section links that highlights the
       section you are looking at
     · the player sits at the top of the feed and STAYS there
       while it plays (the feed is pushed below it), and a
       small floating player takes over if you scroll away
     · every added track is always visible; what you are
       playing is marked with an equaliser, nothing is hidden
   ========================================================= */
const { page } = require('./shell');

const VIDEOS = require('./music-data.js');

/* ---------------------------------------------------------
   Up next — a manual order over the whole catalogue, so
   "next" / "previous" mean something. Anything you play from
   the page is slotted in after the current track.
   --------------------------------------------------------- */
const UP_NEXT = [
  'lacf-Wa4o_A', 'Z1DP7MKH9Rc', '_Sbm7DSPddk', 'DjD4WXMt4No', 'ijpTQkFCjW8'
];

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const dataAttrs = (v) => `data-song="${v.id}" data-title="${esc(v.title)}"
        data-author="${esc(v.author || 'Sounds of Isha')}"`;

/* Card: YouTube grid card — thumbnail, duration, title, channel */
const card = (v) => `
        <article class="vcard" ${dataAttrs(v)}>
          <button class="vcard__thumb" data-video="${v.id}" aria-label="Play ${esc(v.title)}">
            <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" decoding="async" width="480" height="360" />
            ${v.hours || v.len ? `<span class="vcard__dur">${v.hours || v.len}</span>` : ''}
            <span class="vcard__played" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            <span class="vcard__play" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#i-play"></use></svg></span>
          </button>
          <div class="vcard__meta">
            <div class="vcard__txt">
              <h3>${v.title}</h3>
              <p class="vcard__by">${v.author || 'Sounds of Isha'}</p>
              ${v.note ? `<p class="vcard__note">${v.note}</p>` : ''}
            </div>
            <button class="vcard__more" data-queue="${v.id}" aria-label="Add ${esc(v.title)} to queue" title="Add to queue">
              <svg viewBox="0 0 24 24"><use href="#i-plus"></use></svg>
            </button>
          </div>
        </article>`;

/* Row: YouTube "list" item — thumbnail, title, channel, duration */
const row = (v) => `
        <article class="vrow" ${dataAttrs(v)}>
          <button class="vrow__btn" data-video="${v.id}" aria-label="Play ${esc(v.title)}">
            <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" decoding="async" width="480" height="360" />
            ${v.hours || v.len ? `<span class="vrow__dur">${v.hours || v.len}</span>` : ''}
            <span class="vrow__played" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            <span class="vrow__play" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#i-play"></use></svg></span>
          </button>
          <div class="vrow__meta">
            <h4>${v.title}</h4>
            <p>${v.author || 'Sounds of Isha'}</p>
          </div>
          <span class="vrow__len">${v.hours || v.len || ''}</span>
          <button class="vrow__more" data-queue="${v.id}" aria-label="Add ${esc(v.title)} to queue" title="Add to queue">
            <svg viewBox="0 0 24 24"><use href="#i-plus"></use></svg>
          </button>
        </article>`;

const section = (o) => `
      <section class="yt-section" id="${o.id}">
        <div class="yt-section__head">
          <h2>${o.title} <span>${o.items.length}</span></h2>
          ${o.sub ? `<p>${o.sub}</p>` : ''}
        </div>
        <div class="${o.layout === 'rows' ? 'yt-rows' : 'yt-grid'}">
${o.items.map(o.layout === 'rows' ? row : card).join('\n')}
        </div>
      </section>`;

const SECTIONS = [
  {
    id: 'isha', title: 'Sounds of Isha', layout: 'rows',
    sub: 'Chants, stotrams and instrumental music from the Isha channel.',
    items: VIDEOS.isha
  },
  {
    id: 'devotional', title: 'Devotional & bhajans', layout: 'grid',
    sub: 'Marathi devotional, kirtan, film songs and shlokas from other artists.',
    items: VIDEOS.devotional
  },
  { id: 'shelf', title: 'Meditation shelf', layout: 'grid', items: VIDEOS.shelf }
];

const RAIL = [
  ['home', 'Home', 'i-sun'],
  ...SECTIONS.map((s) => [s.id, s.title, s.id === 'isha' ? 'i-lotus' : s.id === 'devotional' ? 'i-flame' : 'i-leaf'])
];

const total = SECTIONS.reduce((n, s) => n + s.items.length, 0);

/* Home row: the first few tracks of each section, YouTube-front-page style */
const FEATURED = [
  ...VIDEOS.isha.slice(0, 2),
  ...VIDEOS.devotional.slice(0, 1),
  ...VIDEOS.shelf.slice(0, 1)
];

const body = `
<!-- top bar (this page owns it — the global site nav is not on this page) -->
<a id="musicTop"></a>
<header class="ytbar">
  <button class="ytbar__burger" id="ytBurger" aria-label="Open menu" aria-expanded="false" aria-controls="ytRail">
    <svg viewBox="0 0 24 24"><use href="#i-menu"></use></svg>
  </button>
  <a class="ytbar__brand" href="music.html">
    <span class="ytbar__mark"><svg viewBox="0 0 48 48"><use href="#logo-mark"></use></svg></span>
    <span class="ytbar__word">Sōma<em>Music</em></span>
  </a>
  <nav class="ytbar__nav" aria-label="Sections">
    ${RAIL.map(([id, label]) => `<a href="#${id}" data-cat="${id}">${label}</a>`).join('\n    ')}
  </nav>
  <a class="ytbar__site" href="index.html" title="Back to the Sōma site">
    <svg viewBox="0 0 24 24"><use href="#i-arrow"></use></svg><span>Site</span>
  </a>
</header>

<div class="yt-shell" id="ytShell">
  <!-- left rail -->
  <nav class="ytrail" id="ytRail" aria-label="Music">
    ${RAIL.map(([id, label, icon]) => `
    <a class="ytrail__item" href="#${id}" data-cat="${id}">
      <svg viewBox="0 0 24 24"><use href="#${icon}"></use></svg>
      <span>${label}</span>
      ${id === 'home' ? '' : `<small>${(SECTIONS.find((s) => s.id === id) || {}).items.length}</small>`}
    </a>`).join('')}
    <div class="ytrail__divider"></div>
    <a class="ytrail__item" href="breathing.html">
      <svg viewBox="0 0 24 24"><use href="#i-wind"></use></svg><span>Breathing</span>
    </a>
    <a class="ytrail__item" href="journey.html">
      <svg viewBox="0 0 24 24"><use href="#i-heart"></use></svg><span>Your journey</span>
    </a>
    <p class="ytrail__foot">${total} tracks · all playable here<br />No search — this is your whole shelf.</p>
  </nav>

  <div class="ytrail__scrim" id="ytRailScrim" hidden></div>

  <!-- feed -->
  <div class="ytmain">
    <!-- player: sticky while it plays, everything else scrolls beneath it -->
    <section class="ytplayer" id="ytPlayer" aria-live="polite">
      <div class="ytplayer__inner">
        <div class="ytplayer__left">
          <div class="ytplayer__stage" id="ytStage">
            <div class="ytplayer__target" id="vplayerTarget"></div>
            <div class="ytidle" id="ytIdle">
              <span class="ytidle__art"><svg viewBox="0 0 48 48"><use href="#logo-mark"></use></svg></span>
              <span class="ytidle__txt">
                <b>Choose a track</b>
                <small>Pick anything below — it plays right here and keeps playing while you browse.</small>
              </span>
            </div>
            <p class="ytplayer__error" id="vplayerError" hidden></p>
          </div>
        </div>

        <div class="ytplayer__right">
          <h1 id="vplayerTitle">Nothing playing</h1>
          <p class="ytplayer__byrow">
            <span class="ytplayer__av"><svg viewBox="0 0 48 48"><use href="#logo-mark"></use></svg></span>
            <span id="vplayerBy">Press play on any track</span>
          </p>
          <div class="ytplayer__row">
            <button class="ytbtn ytbtn--solid" id="vpPrev" aria-label="Previous track" title="Previous">
              <svg viewBox="0 0 24 24"><use href="#i-prev"></use></svg><span>Previous</span>
            </button>
            <button class="ytbtn ytbtn--solid" id="vpNext" aria-label="Next track" title="Next">
              <span>Next</span><svg viewBox="0 0 24 24"><use href="#i-next"></use></svg>
            </button>
            <button class="ytbtn" id="vpStop" aria-label="Stop">
              <svg viewBox="0 0 24 24"><use href="#i-stop"></use></svg><span>Stop</span>
            </button>
            <a class="ytlink" id="vplayerYT" href="#" target="_blank" rel="noopener noreferrer">
              <span class="ytlink__mark" aria-hidden="true">▶</span><span>Watch on YouTube</span>
            </a>
          </div>
          <p class="ytplayer__hint" id="ytHint">Your whole shelf, ${total} tracks — nothing hidden.</p>
        </div>
      </div>
    </section>

    <!-- every section, in full -->
    <div id="ytSections">
      <section class="yt-section" id="home">
        <div class="yt-section__head">
          <h2>Everything, on one shelf <span>${total}</span></h2>
          <p>Every track on this page is playable here — nothing behind a “show more”. Pick one and it starts above; the rest keeps playing while you browse.</p>
          <div class="yt-chips">
            ${RAIL.map(([id, label]) => `<a class="yt-chip" href="#${id}" data-cat="${id}">${label}</a>`).join('\n            ')}
          </div>
        </div>
        <div class="yt-grid yt-grid--feature">
${FEATURED.map(card).join('\n')}
        </div>
      </section>
${SECTIONS.map(section).join('\n')}
    </div>

    <div class="yt-end">
      <p>That is the whole shelf.</p>
      <a class="ytbtn" href="#musicTop">Back to top</a>
    </div>
  </div>

  <!-- right rail: queue -->
  <aside class="ytrail-right" id="ytQueue" aria-label="Queue">
    <div class="ytq__head">
      <h2>Up next</h2>
      <button class="ytq__clear" id="ytQueueClear" type="button">Clear</button>
    </div>
    <ol class="ytq" id="ytQueueList"></ol>
    <p class="ytq__empty" id="ytQueueEmpty">Tracks you play land here, in order.</p>
  </aside>
</div>

<!-- floating mini player: appears only when the full player is out of view -->
<div class="ytmini" id="ytMini" hidden>
  <button class="ytmini__main" id="ytMiniFocus" aria-label="Back to the player">
    <img id="ytMiniArt" src="" alt="" />
    <span class="ytmini__txt">
      <b id="ytMiniTitle">—</b>
      <small id="ytMiniBy">—</small>
    </span>
  </button>
  <button class="ytmini__btn" id="ytMiniStart" aria-label="Back to the player" title="Show player">
    <svg viewBox="0 0 24 24"><use href="#i-arrow"></use></svg>
  </button>
  <button class="ytmini__btn ytmini__btn--stop" id="ytMiniStop" aria-label="Stop" title="Stop">
    <svg viewBox="0 0 24 24"><use href="#i-stop"></use></svg>
  </button>
</div>`;

console.log(page({
  file: 'music.html',
  title: 'Music — Sōma',
  desc: `Every Sounds of Isha chant, devotional, bhajan and meditation track on one page (${total} tracks) — a YouTube-style layout with a player that keeps playing while you browse.`,
  page: 'music',
  body,
  scripts: ['assets/js/music.js'],
  layout: 'yt',
  upNext: UP_NEXT
}));
