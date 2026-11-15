/* Builds journey.html — practice time, streaks and session history.
   The numbers are filled in by assets/js/journey.js from localStorage. */
const { page } = require('./shell');

const body = `
  <section class="page-hero">
    <div>
      <p class="breadcrumb reveal"><a href="index.html">Home</a><span>/</span>Journey</p>
      <h1 class="page-hero__title reveal" data-delay="80">Your quiet <em>accumulation</em>.</h1>
      <p class="page-hero__lead reveal" data-delay="160">
        Every minute you spend breathing is counted here — stored only on this device.
        No account, no cloud, nothing leaves your browser.
      </p>
    </div>
    <div class="page-hero__aside">
      <div class="stat-pill reveal" data-delay="220"><span>Today</span><b id="jToday">0s</b></div>
      <div class="stat-pill reveal" data-delay="300"><span>This week</span><b id="jWeek">0s</b></div>
      <div class="stat-pill reveal" data-delay="380"><span>Days practised</span><b id="jDays">0</b></div>
    </div>
  </section>

  <nav class="subnav" aria-label="Journey sections">
    <a href="#overview" class="is-current">Overview</a>
    <a href="#heat">Last 30 days</a>
    <a href="#patterns">By pattern</a>
    <a href="#recent">Recent sessions</a>
  </nav>

  <section class="section" id="journeyPage">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Overview</p>
      <h2 class="section__title reveal">Time spent <em>breathing</em></h2>
      <p class="section__lead reveal">Minutes accumulate quietly. There are no streak warnings and nothing to break — just a record of what you actually did.</p>
    </div>

    <div class="journey-stats" id="overview">
      <article class="jstat reveal">
        <span class="jstat__label">Total time</span>
        <b class="jstat__value" id="jTotal">0s</b>
        <span class="jstat__sub" id="jTotalSub">no sessions yet</span>
      </article>
      <article class="jstat reveal" data-delay="80">
        <span class="jstat__label">Current streak</span>
        <b class="jstat__value" id="jStreak2">0</b>
        <span class="jstat__sub" id="jStreakSub">days in a row</span>
      </article>
      <article class="jstat reveal" data-delay="160">
        <span class="jstat__label">Sessions</span>
        <b class="jstat__value" id="jCount">0</b>
        <span class="jstat__sub">completed on this device</span>
      </article>
      <article class="jstat reveal" data-delay="240">
        <span class="jstat__label">Average</span>
        <b class="jstat__value" id="jAverage">0s</b>
        <span class="jstat__sub">per session</span>
      </article>
    </div>

    <div class="journey-heat reveal" id="heat">
      <div class="journey-heat__head">
        <h3>Last 30 days</h3>
        <div class="journey-heat__legend" aria-hidden="true">
          <span>less</span><i data-level="0"></i><i data-level="1"></i><i data-level="2"></i><i data-level="3"></i><i data-level="4"></i><span>more</span>
        </div>
      </div>
      <div class="heat" id="jHeat" role="img" aria-label="Practice activity for the last 30 days"></div>
    </div>

    <div class="journey-split">
      <div class="journey-panel reveal" id="patterns">
        <h3>By pattern</h3>
        <p class="journey-panel__lead">Which rhythms you return to most.</p>
        <div class="bars" id="jBreakdown">
          <p class="journey__empty">Your patterns will appear here after your first session.</p>
        </div>
      </div>

      <div class="journey-panel reveal" data-delay="100" id="recent">
        <div class="journey-panel__head">
          <h3>Recent sessions</h3>
          <button class="btn btn--text" id="jReset" type="button">Clear history</button>
        </div>
        <ul class="recent" id="jRecent"></ul>
      </div>
    </div>

    <div class="cta cta--inline reveal">
      <div class="cta__inner">
        <h2>Sit for <em>three minutes</em>.</h2>
        <p>That is the whole instruction. The timer does the rest.</p>
        <a href="breathing.html" class="btn btn--primary">
          <span>Start breathing</span><span class="btn__ripple"></span>
          <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"></use></svg>
        </a>
      </div>
    </div>
  </section>`;

console.log(page({
  file: 'journey.html',
  title: 'Journey — Sōma',
  desc: 'See how much time you have spent on breathing practice: total minutes, daily streak, a 30-day heatmap, your favourite patterns and recent sessions. Stored only on your device.',
  page: 'journey',
  body,
  scripts: ['assets/js/journey.js']
}));
