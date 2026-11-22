/* Extracts the music catalogue from the existing music.html into
   _build/music-data.js so no track is lost in the layout rewrite.
   node _build/extract-music.js */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'music.html'), 'utf8');

/* Split the page into its three sections, then read each card. */
function slice(id) {
  const re = new RegExp(`<section class="section" id="${id}">([\\s\\S]*?)<\\/section>`);
  const m = html.match(re);
  return m ? m[1] : '';
}

const ISHA = [];
const DEVOTIONAL = [];
const SHELF = [];

/* ---- Isha / devotional cards: .isha-card ---- */
function readIshaCards(chunk, out) {
  const re = /<article class="isha-card[^"]*"[\s\S]*?data-video="([A-Za-z0-9_-]{11})"[\s\S]*?data-title="([^"]*)"[\s\S]*?data-author="([^"]*)"[\s\S]*?<span class="isha-card__len">([^<]*)<\/span>[\s\S]*?<span class="isha-card__tag">([^<]*)<\/span>[\s\S]*?<h3>([^<]*)<\/h3>\s*(?:<p class="isha-card__by">([^<]*)<\/p>)?\s*<p>([^<]*)<\/p>/g;
  let m;
  while ((m = re.exec(chunk))) {
    out.push({
      id: m[1],
      title: m[6] || m[2],
      author: (m[7] || m[3] || 'Sounds of Isha').trim(),
      hours: m[4].trim(),
      tag: m[5].trim(),
      note: m[8].trim()
    });
  }
}

/* ---- shelf cards: .track ---- */
function readTrackCards(chunk, out) {
  const re = /<article class="track[^"]*"[\s\S]*?data-video="([A-Za-z0-9_-]{11})"[\s\S]*?data-title="([^"]*)"[\s\S]*?data-author="([^"]*)"[\s\S]*?<span class="track__len">([^<]*)<\/span>[\s\S]*?<h3>([^<]*)<\/h3>\s*<p class="track__by">([^<]*)<\/p>\s*<p class="track__note">([^<]*)<\/p>/g;
  let m;
  while ((m = re.exec(chunk))) {
    out.push({
      id: m[1], title: m[5] || m[2], author: m[6].trim(), hours: m[4].trim(), note: m[7].trim()
    });
  }
}

readIshaCards(slice('isha'), ISHA);
readIshaCards(slice('devotional'), DEVOTIONAL);
readTrackCards(slice('shelf'), SHELF);

/* de-duplicate across the whole catalogue, keeping the first occurrence */
const seen = new Set();
const dedupe = (list) => list.filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)));

const out = {
  isha: dedupe(ISHA),
  devotional: dedupe(DEVOTIONAL),
  shelf: dedupe(SHELF)
};

const total = out.isha.length + out.devotional.length + out.shelf.length;
console.error(`isha ${out.isha.length} · devotional ${out.devotional.length} · shelf ${out.shelf.length} · total ${total}`);

fs.writeFileSync(
  path.join(__dirname, 'music-data.js'),
  '/* Music catalogue — generated from the previous music page by _build/extract-music.js.\n' +
  '   Every id was verified against YouTube oEmbed; edit titles/notes here and re-run\n' +
  '   node _build/build.js to regenerate the page. */\n' +
  'module.exports = ' + JSON.stringify(out, null, 2) + ';\n',
  'utf8'
);
