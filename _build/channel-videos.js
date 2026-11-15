/* Pulls video ids + titles from a YouTube channel's /videos page and skips
   anything already on the site.
   node _build/channel-videos.js @soundsofisha [limit] */
const https = require('https');
const fs = require('fs');
const path = require('path');

const handle = process.argv[2] || '@soundsofisha';
const limit = parseInt(process.argv[3] || '60', 10);

const html = fs.readFileSync(path.join(__dirname, '..', 'music.html'), 'utf8');
const have = new Set([...html.matchAll(/data-video="([A-Za-z0-9_-]{11})"/g)].map((m) => m[1]));

const get = (url) => new Promise((resolve, reject) => {
  https.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept-Language': 'en-US,en;q=0.9' }
  }, (res) => {
    let body = '';
    res.on('data', (d) => (body += d));
    res.on('end', () => resolve(body));
  }).on('error', reject);
});

(async () => {
  const body = await get(`https://www.youtube.com/${handle}/videos`);
  const unique = [...new Set([...body.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)].map((m) => m[1]))];

  const rows = [];
  for (const id of unique) {
    if (have.has(id)) continue;
    const at = body.indexOf(`"videoId":"${id}"`);
    const slice = body.slice(Math.max(0, at - 2500), at + 2500);
    let title = '';
    for (const t of slice.matchAll(/"text":"((?:[^"\\]|\\.){6,180})"/g)) {
      const cand = t[1].replace(/\\u0026/g, '&').replace(/\\"/g, '"').replace(/\\u0027/g, "'");
      if (/^(-?\d|New$|Live$|Premium$)/.test(cand)) continue;
      if (/^[A-Za-z0-9\s,.'’!&()-]+$/.test(cand) && /\s/.test(cand)) { title = cand; break; }
    }
    rows.push([id, title || '(title not parsed)']);
    if (rows.length >= limit) break;
  }

  for (const [id, title] of rows) console.log(`${id}\t${title}`);
  console.error(`\nnew candidates: ${rows.length} of ${unique.length} ids`);
})();
