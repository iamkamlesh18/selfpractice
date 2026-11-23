/* Shared HTML shell for every page — guarantees identical nav, sprite, backdrop and footer. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const NAV = [
  ['index.html', 'Home', 'home'],
  ['breathing.html', 'Breathing', 'breathing'],
  ['yoga.html', 'Yoga', 'yoga'],
  ['frequencies.html', 'Frequencies', 'frequencies'],
  ['chakras.html', 'Chakras', 'chakras'],
  ['music.html', 'Music', 'music'],
  ['journey.html', 'Journey', 'journey']
];

const SPRITE = fs.readFileSync(path.join(ROOT, 'assets', 'partials', 'sprite.svg'), 'utf8').trim();

function head({ title, desc, page }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#0a0713" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:type" content="website" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@200;300;400;500;600&display=swap" rel="stylesheet" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='12' fill='%230d0a1a'/%3E%3Cpath d='M24 8c4 5 6 10 6 14.5S28 31 24 34.5c-4-3.5-6-7.5-6-12S20 13 24 8Z' fill='%2379f2dc'/%3E%3Cpath d='M24 36c-3-4-7-7-12-9 1 7 5 11 12 13 7-2 11-6 12-13-5 2-9 5-12 9Z' fill='%238b7bf7'/%3E%3C/svg%3E" />
<link rel="stylesheet" href="styles.css" />
</head>
<body data-page="${page}">

${SPRITE}

<!-- ===================== BACKDROP ===================== -->
<div class="backdrop" aria-hidden="true">
  <div class="aurora aurora--1"></div>
  <div class="aurora aurora--2"></div>
  <div class="aurora aurora--3"></div>
  <div class="grain"></div>
  <canvas id="stars"></canvas>
</div>

<!-- ===================== NAV ===================== -->
<header class="nav" id="nav">
  <div class="nav__inner">
    <a href="index.html" class="brand" aria-label="Sōma home">
      <span class="brand__mark"><svg viewBox="0 0 48 48"><use href="#logo-mark"/></svg></span>
      <span class="brand__word">Sōma</span>
    </a>
    <nav class="nav__links" aria-label="Primary">
${NAV.map(([href, label, key]) => `      <a href="${href}"${key === page ? ' class="is-current" aria-current="page"' : ''}>${label}</a>`).join('\n')}
    </nav>
    <a href="breathing.html" class="btn btn--ghost nav__cta">
      <span>Begin</span><svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg>
    </a>
    <button class="nav__burger" aria-label="Open menu" aria-expanded="false"><span></span></button>
  </div>
</header>
`;
}

function footer() {
  return `
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__brand">
      <a href="index.html" class="brand">
        <span class="brand__mark"><svg viewBox="0 0 48 48"><use href="#logo-mark"/></svg></span>
        <span class="brand__word">Sōma</span>
      </a>
      <p>Made slowly, for people who are tired of being rushed.</p>
    </div>
    <nav class="footer__cols" aria-label="Footer">
      <div>
        <h4>Practice</h4>
        <a href="breathing.html">Breathing</a>
        <a href="yoga.html">Yoga</a>
        <a href="breathing.html#pranayama">Pranayama</a>
        <a href="chakras.html">Chakra meditation</a>
        <a href="journey.html">Your journey</a>
      </div>
      <div>
        <h4>Explore</h4>
        <a href="frequencies.html">Frequencies</a>
        <a href="yoga.html#surya-namaskar">Surya Namaskar</a>
        <a href="music.html">Music</a>
        <a href="breathing.html#sounds">Soundscapes</a>
      </div>
      <div>
        <h4>Elsewhere</h4>
        <a href="index.html">Home</a>
        <a href="index.html#voices">Voices</a>
        <a href="index.html#about">About</a>
      </div>
    </nav>
  </div>
  <div class="footer__credits">
    Ambient track:
    <a href="https://commons.wikimedia.org/wiki/File:Spiritual_Ambient_by_MusicLFiles.ogg" target="_blank" rel="noopener noreferrer">“Spiritual Ambient”</a>
    by <a href="https://commons.wikimedia.org/wiki/Category:Files_by_MusicLFiles" target="_blank" rel="noopener noreferrer">MusicLFiles</a>,
    licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.
    Changes: looped and volume-adjusted for background listening.
  </div>
  <div class="footer__base">
    <span>© <span id="year"></span> Sōma — breathe well.</span>
    <span>Made with breath · no trackers, no noise</span>
  </div>
</footer>
`;
}

/* In-page YouTube theatre, used by music.html.
   YouTube supplies the whole control bar (play, seek, volume, speed, quality,
   captions, fullscreen) — it is their player, so their chrome. We only add:
     · close            (Esc)
     · picture-in-picture — keeps the video playing while you browse the site
     · minimize-to-dock — closes the theatre but keeps the audio going
     · open on YouTube  — so views and watch time go to the creator
   Playback is never paused when the tab is hidden or minimised. */
const PLAYER = `
<div class="vplayer" id="vplayer" role="dialog" aria-modal="true" aria-labelledby="vplayerTitle" hidden>
  <div class="vplayer__backdrop" data-close></div>
  <div class="vplayer__panel" id="vplayerPanel">
    <div class="vplayer__stage">
      <div class="vplayer__frame">
        <div id="vplayerTarget"></div>
        <p class="vplayer__error" id="vplayerError" hidden></p>
      </div>
    </div>

    <div class="vplayer__bar">
      <div class="vplayer__info">
        <b id="vplayerTitle">—</b>
        <span id="vplayerBy">—</span>
      </div>
      <div class="vplayer__actions">
        <a class="vplayer__link" id="vplayerYT" href="#" target="_blank" rel="noopener noreferrer"
           title="Watch on YouTube — supports the creator">
          <span class="vplayer__ytmark" aria-hidden="true">▶</span> Watch on YouTube
        </a>
        <button class="vbtn" id="vpPip" aria-label="Picture in picture" title="Keep playing while browsing (P)">
          <svg viewBox="0 0 24 24" class="ico"><use href="#i-pip"></use></svg>
        </button>
        <button class="vbtn" id="vpMin" aria-label="Minimize and keep playing" title="Minimize — keep the music playing">
          <svg viewBox="0 0 24 24" class="ico"><use href="#i-minimize"></use></svg>
        </button>
        <button class="vbtn vbtn--close" data-close aria-label="Close and stop" title="Close and stop (Esc)">
          <svg viewBox="0 0 24 24" class="ico"><use href="#i-close"></use></svg>
        </button>
      </div>
    </div>
  </div>
</div>`;

/* Persistent mini-player: shows whatever is playing and follows you
   from page to page. State is mirrored into localStorage by ambient.js. */
const DOCK = `
<div class="dock" id="dock" hidden aria-live="polite">
  <div class="dock__art" id="dockArt">
    <svg viewBox="0 0 48 48" aria-hidden="true"><use href="#logo-mark"></use></svg>
  </div>
  <div class="dock__body">
    <b id="dockTitle">—</b>
    <span id="dockSub">—</span>
    <div class="dock__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </div>
  <div class="dock__vol">
    <button class="dock__btn dock__btn--mute" id="dockMute" aria-label="Mute" title="Mute">
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-volume"></use></svg>
    </button>
    <input class="dock__range" id="dockVol" type="range" min="0" max="100" value="45" aria-label="Volume" />
  </div>
  <button class="dock__btn dock__btn--main" id="dockToggle" aria-label="Pause" title="Play / Pause">
    <svg viewBox="0 0 24 24" class="ico"><use href="#i-pause"></use></svg>
  </button>
  <button class="dock__btn dock__btn--close" id="dockClose" aria-label="Stop and close" title="Stop">
    <svg viewBox="0 0 24 24" class="ico"><use href="#i-close"></use></svg>
  </button>
</div>
<div class="ambient-prompt" id="ambientPrompt" hidden>
  <button class="ambient-prompt__btn" id="ambientStart" type="button">
    <svg viewBox="0 0 24 24" class="ico"><use href="#i-music"></use></svg>
    <span>Play ambient music</span>
    <small>Spiritual Ambient · optional</small>
  </button>
  <button class="ambient-prompt__no" id="ambientNo" type="button" aria-label="Not now">Not now</button>
</div>`;

/* Data carried into the page for the YouTube-style player (music.html). */
function appData({ upNext } = {}) {
  if (!upNext || !upNext.length) return '';
  return `
<script>
  window.SOMA_UPNEXT = ${JSON.stringify(upNext)};
</script>`;
}

function page({ file, title, desc, page, body, scripts = [], bodyClass = '', modals = false, layout = '', upNext = [] }) {
  /* "yt" layout: the page provides its own top bar and side rails, so the
     global nav, footer and audio dock are omitted to leave a clean app shell. */
  const isApp = layout === 'yt';

  const html = `${head({ title, desc, page })}${isApp ? appData({ upNext }) : ''}
<main${bodyClass ? ` class="${bodyClass}"` : ''} id="top">
${body.trim()}
</main>
${modals ? PLAYER : ''}
${isApp ? '' : DOCK}
${isApp ? '' : footer()}
<script src="assets/js/site.js"></script>
${isApp ? '' : '<script src="assets/js/ambient.js"></script>'}
${scripts.map((s) => `<script src="${s}"></script>`).join('\n')}
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, file), html, 'utf8');
  return `${file}  (${html.length} chars)`;
}

module.exports = { page, ROOT };
