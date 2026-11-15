/* =========================================================
   SŌMA — practice journey
   Records breathing sessions in localStorage and renders the
   Journey page: total time, streak, latest sessions, per-pattern
   breakdown, and a 30-day activity heatmap.

   Public API (used by breath.js and chakra.js):
     SomaJourney.add(seconds, kind, label)
     SomaJourney.history()
     SomaJourney.stats()
   ========================================================= */
(() => {
  'use strict';

  const STORE = 'soma.journey.v1';
  const DAY = 86400000;
  const MAX_ENTRIES = 500;

  /* ---------- storage ---------- */
  function read() {
    try {
      const raw = localStorage.getItem(STORE);
      const data = raw ? JSON.parse(raw) : null;
      if (!data || !Array.isArray(data.sessions)) return { sessions: [] };
      return data;
    } catch (e) {
      return { sessions: [] };
    }
  }

  function write(data) {
    try {
      // keep the file small — oldest entries fall off first
      if (data.sessions.length > MAX_ENTRIES) {
        data.sessions = data.sessions.slice(-MAX_ENTRIES);
      }
      localStorage.setItem(STORE, JSON.stringify(data));
    } catch (e) { /* private mode / quota */ }
  }

  const dayKey = (ts) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  /* ---------- recording ---------- */
  function add(seconds, kind, label) {
    const s = Math.round(Number(seconds) || 0);
    if (s < 5) return;               // ignore accidental taps
    const data = read();
    data.sessions.push({ t: Date.now(), s, k: kind || 'breath', l: label || '' });
    write(data);
    window.dispatchEvent(new CustomEvent('soma:journey', { detail: { seconds: s } }));
  }

  /* ---------- statistics ---------- */
  function stats() {
    const { sessions } = read();
    const now = Date.now();
    const total = sessions.reduce((n, x) => n + x.s, 0);

    // consecutive days including today (or yesterday, so a streak survives until midnight)
    const days = new Set(sessions.map((x) => dayKey(x.t)));
    let streak = 0;
    for (let i = 0; i < 400; i++) {
      const k = dayKey(now - i * DAY);
      if (days.has(k)) streak++;
      else if (i === 0) continue;   // today not practised yet — keep looking
      else break;
    }

    const todayKey = dayKey(now);
    const today = sessions.filter((x) => dayKey(x.t) === todayKey).reduce((n, x) => n + x.s, 0);

    const week = sessions.filter((x) => now - x.t < 7 * DAY).reduce((n, x) => n + x.s, 0);

    // per-pattern totals
    const byLabel = {};
    sessions.forEach((x) => {
      const key = x.l || 'Breathing';
      byLabel[key] = (byLabel[key] || 0) + x.s;
    });

    // 30-day heatmap: day -> seconds
    const heat = [];
    for (let i = 29; i >= 0; i--) {
      const ts = now - i * DAY;
      const k = dayKey(ts);
      const secs = sessions.filter((x) => dayKey(x.t) === k).reduce((n, x) => n + x.s, 0);
      heat.push({ key: k, ts: ts - (ts % DAY), secs });
    }

    return {
      sessions,
      total,
      streak,
      today,
      week,
      count: sessions.length,
      byLabel,
      heat,
      daysPractised: days.size
    };
  }

  /* ---------- formatting ---------- */
  function human(secs) {
    secs = Math.round(secs || 0);
    if (secs < 60) return `${secs}s`;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h) return `${h}h ${m}m`;
    return `${m}m ${secs % 60}s`;
  }

  window.SomaJourney = { add, stats, history: () => read().sessions, human };

  /* =========================================================
     Render the Journey page (only runs where the markup exists)
     ========================================================= */
  const root = document.getElementById('journeyPage');
  if (!root) return;

  const el = (id) => document.getElementById(id);

  function render() {
    const s = stats();

    el('jTotal').textContent = human(s.total);
    el('jTotalSub').textContent = s.total ? `across ${s.count} session${s.count === 1 ? '' : 's'}` : 'no sessions yet';

    el('jStreak2').textContent = String(s.streak);
    el('jStreakSub').textContent = s.streak === 1 ? 'day in a row' : 'days in a row';

    el('jCount').textContent = String(s.count);
    el('jAverage').textContent = s.count ? human(s.total / s.count) : '0s';

    el('jToday').textContent = human(s.today);
    el('jWeek').textContent = human(s.week);
    el('jDays').textContent = String(s.daysPractised);

    /* --- 30-day heatmap --- */
    const heat = el('jHeat');
    if (heat) {
      const max = Math.max(1, ...s.heat.map((d) => d.secs));
      heat.innerHTML = s.heat.map((d) => {
        const ratio = d.secs / max;
        const level = d.secs === 0 ? 0 : ratio > 0.75 ? 4 : ratio > 0.45 ? 3 : ratio > 0.15 ? 2 : 1;
        const label = d.secs ? `${human(d.secs)} on ${d.key}` : `nothing on ${d.key}`;
        return `<span class="heat__cell" data-level="${level}" title="${label}" aria-label="${label}"></span>`;
      }).join('');
    }

    /* --- per-pattern breakdown --- */
    const bars = el('jBreakdown');
    if (bars) {
      const entries = Object.entries(s.byLabel).sort((a, b) => b[1] - a[1]);
      if (!entries.length) {
        bars.innerHTML = '<p class="journey__empty">Your patterns will appear here after your first session.</p>';
      } else {
        const max = entries[0][1];
        bars.innerHTML = entries.map(([label, secs]) => `
          <div class="bar">
            <div class="bar__top"><span>${label}</span><b>${human(secs)}</b></div>
            <div class="bar__track"><i style="width:${Math.max(4, (secs / max) * 100).toFixed(1)}%"></i></div>
          </div>`).join('');
      }
    }

    /* --- recent sessions --- */
    const list = el('jRecent');
    if (list) {
      const recent = s.sessions.slice(-8).reverse();
      if (!recent.length) {
        list.innerHTML = `<li class="journey__empty-row">
          <span>Nothing yet —</span>
          <a href="breathing.html" class="btn btn--text">start a session</a>
        </li>`;
      } else {
        list.innerHTML = recent.map((x) => {
          const d = new Date(x.t);
          const when = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          return `<li>
            <span class="recent__dot" data-k="${x.k}"></span>
            <span class="recent__label">${x.l || 'Breathing'}</span>
            <span class="recent__when">${when} · ${time}</span>
            <b class="recent__dur">${human(x.s)}</b>
          </li>`;
        }).join('');
      }
    }

    /* --- empty / filled states --- */
    const has = s.count > 0;
    root.dataset.has = has ? '1' : '0';
  }

  el('jReset')?.addEventListener('click', () => {
    if (!confirm('Clear your practice history? This cannot be undone.')) return;
    write({ sessions: [] });
    render();
  });

  render();
  window.addEventListener('soma:journey', render);
})();
