/* Ensures each JS bundle's required DOM hooks exist on the pages that load it.
   node _build/check-scripts.js */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

/* For each script, the selectors/ids it needs present on the page */
const REQUIRES = {
  'assets/js/breath.js': ['[data-breath]', '.pattern', '.bo__ring'],
  'assets/js/sounds.js': ['.sound-card', '#audioStatus'],
  'assets/js/pranayama.js': ['.prana__play'],
  'assets/js/yoga.js': ['.subnav'],
  'assets/js/frequencies.js': ['#freqGrid', '.freq'],
  'assets/js/chakra.js': ['#chakraStage', '.chakra-item', '#ckGo'],
  'assets/js/music.js': ['#trackGrid', '.track'],
  'assets/js/site.js': ['#nav']
};

/* Does the markup contain an element matching a simple selector? */
function hasSelector(html, sel) {
  if (sel.startsWith('#')) return new RegExp(`id="${sel.slice(1)}"`).test(html);
  if (sel.startsWith('.')) {
    const cls = sel.slice(1);
    return new RegExp(`class="[^"]*\\b${cls}\\b[^"]*"`).test(html);
  }
  if (sel.startsWith('[')) return html.includes(sel.slice(1, -1).split('=')[0]);
  return html.includes(sel);
}

/* Every element a script looks up by id at load time must exist on its page.
   (A typo here silently disables a button, which is exactly how bugs hide.) */
function checkIds(p, html, src) {
  const code = fs.readFileSync(path.join(ROOT, src), 'utf8');
  const ids = [...code.matchAll(/\$\('#([A-Za-z0-9_-]+)'\)/g)].map((m) => m[1]);
  for (const id of new Set(ids)) {
    // ids the script itself injects into the DOM are not in the static HTML
    const generated = new RegExp(`id="\\$?\{?${id}`).test(code) || code.includes(`id="${id}"`);
    if (generated) continue;
    if (!new RegExp(`id="${id}"`).test(html)) {
      console.log(`  MISSING #id     ${p}: ${src} looks up #${id}`);
      problems++;
    }
  }
}

let problems = 0;
for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
  const loaded = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);

  for (const src of loaded) {
    if (!fs.existsSync(path.join(ROOT, src))) {
      console.log(`  MISSING SCRIPT  ${p} -> ${src}`);
      problems++;
      continue;
    }
    checkIds(p, html, src);
    for (const sel of REQUIRES[src] || []) {
      const ok = hasSelector(html, sel);
      if (!ok) {
        console.log(`  MISSING HOOK    ${p} loads ${src} but has no ${sel}`);
        problems++;
      }
    }
  }

  // every page must load the shared runtime
  if (!loaded.includes('assets/js/site.js')) {
    console.log(`  NO SITE.JS      ${p}`);
    problems++;
  }

  // warn about buttons that exist but whose handler never loads
  if (/class="prana__play"/.test(html) && !loaded.includes('assets/js/pranayama.js')) {
    console.log(`  DEAD BUTTONS    ${p} has .prana__play but no pranayama.js`);
    problems++;
  }
}

console.log(problems ? `\n${problems} problem(s).` : '\nEvery script is loaded by a page that has its DOM hooks.');
