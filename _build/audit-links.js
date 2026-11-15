/* Audits every YouTube id from the whole conversation against music.html.
   Reports: present / missing / duplicated.  node _build/audit-links.js */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'music.html'), 'utf8');

/* Every id ever pasted, in the order it was pasted. */
const BATCH_1 = [
  'lacf-Wa4o_A', 'Z1DP7MKH9Rc', '_Sbm7DSPddk', 'DjD4WXMt4No', 'dJON7OZYHcY',
  'pv7ZiedzncE', 'GemW0xWAi6c', 'GePN4-Cajvk', 'l3CunU4M0jQ', 'CYT7WfoTZZ4',
  'kJkaEOaNM4A', 'sfdQwmgaS1M', 'IdLhCGU78j4', 'iUrjWDnyFCM', '41cn42LltI4',
  'FEGlQt11p4E', 'VECfX823mxU', 'luwe3NKvxos', '6rJExE8HGVg', 'yh1uxjP7nYI',
  'ijpTQkFCjW8', 'Fh53p0Tnnxg', '4smH2362ulU'
];

const BATCH_2 = [
  '4ZtihFRxK28', '5XJF56WrFoM', 'haGL4d2qCRY', 'oHM4zm8OdGU', 'z1QDVL_IxI8',
  '41cn42LltI4', 'TH8Y7DhLPOA', 'wPxyhivAWNU', 'LVojRjzUJLE', '_PBzu_-_ul4',
  '_PBzu_-_ul4', 'vI9st5RjkBw', 'xAG4mZmoH1o', 'w3IMkVKh5lU', '4JcquT3A78o',
  'e-w7BuYOYKY', 'gsuskHo4Bqk', 'zEGD7ZDcHMo', '3WrImrl2dmI', '-x9Ly8ZjA18',
  'tZKHQD6oC2s', 'CH8sA9Pd6Gc', 'VJ-o8y8JqCQ', 'uV5zVWTz-Dk', 'BlEXTDMsBII',
  'sHVUlXAvCd0', 'xaUvx0IILW4', '2aJJ28mIrco', 'MvNyxxK07H4', 'i4BGIBsTWS4',
  'US9FsAA9U0Q', 'mUcAkCi8Dtw', '1QjDwNpQy88', 'ycEI-_NXvEo', '8H0HEZDvYVw',
  'nRJD6kldukQ', 'PaoeGgJs3Ac', 'Y8QyyACKa70', '2pVK0kxgfE4', 'Fh53p0Tnnxg',
  '4smH2362ulU'
];

/* ids already on the site before these batches (the original hand-picked shelf) */
const ORIGINAL_SHELF = [
  'pnkFJ0NQrkM', 'vH11undyI2o', '05c7SkvFY_o', 'J11VChbAboA', '0D4V5awe-PA',
  'UuidkAboVQw', 'C9hMaqQFKXk', 'PFsGsmtPz24', 'NF35xujl23c', 'WZ6hDuI23qU',
  'Jyy0ra2WcQQ', 'N4qCFFBrrgk', 'Tqx0l2YaKlE', 'IKzkc3FWx7g', 'Ho68X9QKxfc',
  'eWLVBP3VrO4', 'A0X61Cukxg0', 'N5hFNoRcMVU', 'DulNz2CkoHI', 'wlN_3cu7Xe4'
];

const pasted = [...new Set([...BATCH_1, ...BATCH_2])];
const cards = [...html.matchAll(/data-video="([A-Za-z0-9_-]{11})"/g)].map((m) => m[1]);
const counts = cards.reduce((a, id) => ((a[id] = (a[id] || 0) + 1), a), {});

const missing = pasted.filter((id) => !counts[id]);
const dupes = Object.entries(counts).filter(([, c]) => c > 1);
const origMissing = ORIGINAL_SHELF.filter((id) => !counts[id]);

console.log(`Pasted (unique)            : ${pasted.length}`);
console.log(`Cards on the page          : ${cards.length}`);
console.log(`Unique videos on the page  : ${Object.keys(counts).length}`);
console.log(`Original shelf preserved   : ${ORIGINAL_SHELF.length - origMissing.length}/${ORIGINAL_SHELF.length}`);
console.log(`Missing from pasted links  : ${missing.length}`);
console.log(`Duplicated cards           : ${dupes.length}`);

if (missing.length) console.log('\nMISSING:\n  ' + missing.join('\n  '));
if (origMissing.length) console.log('\nORIGINAL MISSING:\n  ' + origMissing.join('\n  '));
if (dupes.length) console.log('\nDUPLICATES:\n  ' + dupes.map(([id, c]) => `${id} x${c}`).join('\n  '));

if (!missing.length && !dupes.length && !origMissing.length) {
  console.log('\nEvery pasted link is on the page exactly once, and nothing was lost.');
}
