/* Static link/asset checker: node _build/check-links.js */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let problems = 0;
const idsByPage = {};

// collect ids per page so #anchors can be verified
for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
  idsByPage[p] = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
}

for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');

  // href / src references
  const refs = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|data:|mailto:|about:|#)/.test(ref)) {
      if (ref.startsWith('#') && ref.length > 1) {
        const id = ref.slice(1);
        if (!idsByPage[p].has(id)) {
          console.log(`  MISSING ANCHOR  ${p} -> ${ref}`);
          problems++;
        }
      }
      continue;
    }
    const [file, hash] = ref.split('#');
    const target = path.join(ROOT, file);
    if (!fs.existsSync(target)) {
      console.log(`  MISSING FILE    ${p} -> ${ref}`);
      problems++;
    } else if (hash && idsByPage[file] && !idsByPage[file].has(hash)) {
      console.log(`  MISSING ANCHOR  ${p} -> ${ref}`);
      problems++;
    }
  }

  // <use href="#id"> must exist as a symbol in that page
  const symbols = new Set([...html.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/<use href="#([^"]+)"/g)) {
    if (!symbols.has(m[1])) {
      console.log(`  MISSING SYMBOL  ${p} -> #${m[1]}`);
      problems++;
    }
  }

  // duplicate ids
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) {
    console.log(`  DUPLICATE IDS   ${p} -> ${[...new Set(dupes)].join(', ')}`);
    problems++;
  }
}

console.log(problems ? `\n${problems} problem(s) found.` : '\nAll links, anchors, symbols and ids are clean.');
