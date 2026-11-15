/* Offline test of the journey recording/statistics logic.
   node _build/test-journey.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/* minimal localStorage + window/document shims */
const store = {};
const localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};

const listeners = {};
const document = {
  getElementById: () => null,           // no Journey UI → render() is skipped
  addEventListener: () => { }
};
const window = {
  addEventListener: (n, f) => { (listeners[n] = listeners[n] || []).push(f); },
  dispatchEvent: (e) => (listeners[e.type] || []).forEach((f) => f(e)),
  CustomEvent: class { constructor(type, opts) { this.type = type; this.detail = opts && opts.detail; } }
};

class CustomEvent {
  constructor(type, opts) { this.type = type; this.detail = (opts && opts.detail) || null; }
}

const ctx = { window, document, localStorage, console, Date, Math, JSON, CustomEvent };
ctx.globalThis = ctx;
vm.createContext(ctx);

const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'journey.js'), 'utf8');
vm.runInContext(src, ctx);

const J = window.SomaJourney;
const assert = (c, m) => { if (!c) { console.error('FAIL: ' + m); process.exitCode = 1; } else console.log('ok  ' + m); };

/* ignore sub-5s taps */
J.add(2, 'breath', '4–4');
assert(J.stats().count === 0, 'sessions under 5s are ignored');

/* record three sessions today */
J.add(120, 'breath', '4–7–8');
J.add(300, 'breath', '4–4 Equal Breath');
J.add(180, 'chakra', 'Root Chakra · 3 min');

const s = J.stats();
assert(s.count === 3, 'three sessions recorded');
assert(s.total === 600, 'total seconds = 600 (got ' + s.total + ')');
assert(s.today === 600, 'today seconds = 600');
assert(s.streak === 1, 'streak = 1 day (got ' + s.streak + ')');
assert(s.daysPractised === 1, 'one day practised');
assert(s.byLabel['4–4 Equal Breath'] === 300, 'per-pattern total is correct');
assert(s.heat.length === 30, 'heatmap has 30 days');
assert(s.heat[29].secs === 600, 'today is the last heatmap cell');

/* a session two days ago should not break the streak */
const data = JSON.parse(store['soma.journey.v1']);
data.sessions.push({ t: Date.now() - 2 * 86400000, s: 60, k: 'breath', l: 'Box' });
store['soma.journey.v1'] = JSON.stringify(data);
assert(J.stats().streak === 1, 'gap two days ago does not inflate the streak');

/* formatting */
assert(J.human(45) === '45s', 'human(45) = 45s');
assert(J.human(90) === '1m 30s', 'human(90) = 1m 30s');
assert(J.human(3720) === '1h 2m', 'human(3720) = 1h 2m');

console.log('\njourney logic ' + (process.exitCode ? 'FAILED' : 'OK'));
