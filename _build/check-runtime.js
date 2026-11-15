/* Runtime-order + reliability checks that do not need a browser.
   node _build/check-runtime.js */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let problems = 0;

for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);

  // site.js defines window.Soma, which every other bundle depends on.
  const siteIdx = scripts.indexOf('assets/js/site.js');
  const dependents = scripts.filter((s) => s !== 'assets/js/site.js');
  if (siteIdx !== 0 && dependents.length) {
    console.log(`  SCRIPT ORDER    ${p}: site.js must load FIRST (found at index ${siteIdx})`);
    problems++;
  }

  // a bundle that only reads window.Soma must not be loaded before it exists
  for (const s of dependents) {
    const src = fs.readFileSync(path.join(ROOT, s), 'utf8');
    if (/window\.Soma/.test(src) && scripts.indexOf(s) < siteIdx) {
      console.log(`  DEPENDENCY      ${p}: ${s} reads window.Soma before site.js`);
      problems++;
    }
  }
}

// anything that builds an HTML attribute from a URL must escape it
for (const f of fs.readdirSync(path.join(ROOT, '_build'))) {
  if (!f.endsWith('.js')) continue;
  const src = fs.readFileSync(path.join(ROOT, '_build', f), 'utf8');
  for (const m of src.matchAll(/<img[^>]*style="[^"]*\$\{/g)) {
    console.log(`  UNESCAPED URL   _build/${f}: ${m[0].slice(0, 60)}`);
    problems++;
  }
}

console.log(problems ? `\n${problems} problem(s).` : '\nScript order and URL escaping look correct.');
