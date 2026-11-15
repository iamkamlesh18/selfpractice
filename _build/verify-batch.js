/* Verifies a batch of YouTube ids: oEmbed title + channel.
   node _build/verify-batch.js */
const https = require('https');

const IDS = [
  // ---- your newest batch ----
  '4ZtihFRxK28', '5XJF56WrFoM', 'haGL4d2qCRY', 'oHM4zm8OdGU', 'z1QDVL_IxI8',
  'TH8Y7DhLPOA', 'wPxyhivAWNU', 'LVojRjzUJLE', '_PBzu_-_ul4', 'vI9st5RjkBw',
  'xAG4mZmoH1o', 'w3IMkVKh5lU', '4JcquT3A78o', 'e-w7BuYOYKY', 'gsuskHo4Bqk',
  'zEGD7ZDcHMo', '3WrImrl2dmI', '-x9Ly8ZjA18', 'tZKHQD6oC2s', 'CH8sA9Pd6Gc',
  'VJ-o8y8JqCQ', 'uV5zVWTz-Dk', 'BlEXTDMsBII', 'sHVUlXAvCd0', 'xaUvx0IILW4',
  '2aJJ28mIrco', 'MvNyxxK07H4', 'i4BGIBsTWS4', 'US9FsAA9U0Q', 'mUcAkCi8Dtw',
  '1QjDwNpQy88', 'ycEI-_NXvEo', '8H0HEZDvYVw', 'nRJD6kldukQ', 'PaoeGgJs3Ac',
  'Y8QyyACKa70', '2pVK0kxgfE4'
];

const get = (url) => new Promise((resolve) => {
  https.get(url, { headers: { 'User-Agent': 'soma-build-check' } }, (res) => {
    let body = '';
    res.on('data', (d) => (body += d));
    res.on('end', () => {
      try { resolve({ status: res.statusCode, json: JSON.parse(body) }); }
      catch (e) { resolve({ status: res.statusCode, json: null }); }
    });
  }).on('error', () => resolve({ status: 0, json: null }));
});

(async () => {
  const out = [];
  for (const id of IDS) {
    const { status, json } = await get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    if (status === 200 && json) {
      out.push(`OK   ${id}\t${json.author_name}\t${json.title}`);
    } else {
      out.push(`FAIL ${id}\tHTTP ${status}`);
    }
  }
  console.log(out.join('\n'));
})();
