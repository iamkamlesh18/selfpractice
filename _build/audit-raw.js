/* Second, independent pass: extracts ids straight from a raw text dump of the
   conversation's URLs and checks each is on the page.
   node _build/audit-raw.js <file-with-urls.txt> */
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.log('usage: node _build/audit-raw.js <file>'); process.exit(1); }

const raw = fs.readFileSync(file, 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'music.html'), 'utf8');
const onPage = new Set([...html.matchAll(/data-video="([A-Za-z0-9_-]{11})"/g)].map((m) => m[1]));

const ids = [...raw.matchAll(/(?:watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/g)].map((m) => m[1]);
const unique = [...new Set(ids)];
const missing = unique.filter((id) => !onPage.has(id));

console.log(`URL mentions in text : ${ids.length}`);
console.log(`Unique ids           : ${unique.length}`);
console.log(`Present on page      : ${unique.length - missing.length}`);
console.log(`Missing              : ${missing.length}`);
if (missing.length) console.log('\nMISSING:\n  ' + missing.join('\n  '));
else console.log('\nAll ids found in the text are on the page.');
