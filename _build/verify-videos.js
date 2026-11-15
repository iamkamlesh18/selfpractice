/* Verifies a list of YouTube ids against oEmbed.
   node _build/verify-videos.js id1 id2 ... */
const https = require('https');

const ids = process.argv.slice(2);

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
  for (const id of ids) {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    const { status, json } = await get(url);
    if (status === 200 && json) {
      console.log(`OK    ${id}\t${json.title}\t${json.author_name}`);
    } else {
      console.log(`FAIL  ${id}\tHTTP ${status}`);
    }
  }
})();
