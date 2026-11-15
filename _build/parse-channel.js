/* Parses a saved YouTube channel page (_build/_chan.html) into id/title pairs.
   node _build/parse-channel.js */
const fs = require('fs');
const path = require('path');

const body = fs.readFileSync(path.join(__dirname, '_chan.html'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'music.html'), 'utf8');
const have = new Set([...html.matchAll(/data-video="([A-Za-z0-9_-]{11})"/g)].map((m) => m[1]));

const unique = [...new Set([...body.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)].map((m) => m[1]))];

const rows = [];
for (const id of unique) {
  if (have.has(id)) continue;
  const at = body.indexOf(`"videoId":"${id}"`);
  const slice = body.slice(Math.max(0, at - 3000), at + 3000);
  let title = '';
  for (const t of slice.matchAll(/"text":"((?:[^"\\]|\\.){6,180})"/g)) {
    const cand = t[1].replace(/\\u0026/g, '&').replace(/\\"/g, '"').replace(/\\u0027/g, "'");
    if (/^(-?\d|New$|Live$|Premium$)/.test(cand)) continue;
    if (/\s/.test(cand)) { title = cand; break; }
  }
  rows.push([id, title || '(no title)']);
}

for (const [id, title] of rows) console.log(`${id}\t${title}`);
console.error(`\nids in page: ${unique.length} · new: ${rows.length}`);
