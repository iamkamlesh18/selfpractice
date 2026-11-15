/* Builds index.html and breathing.html from the shared shell. */
const { page } = require('./shell');

/* ============================ shared breathing widget ============================ */
const breathWidget = ({ hint = 'press begin' } = {}) => `
      <div class="breath-stage reveal" data-delay="120" data-breath>
        <div class="breath-orb" id="breathOrb" data-phase="idle">
          <div class="bo__halo bo__halo--1"></div>
          <div class="bo__halo bo__halo--2"></div>
          <div class="bo__halo bo__halo--3"></div>
          <svg class="bo__progress" viewBox="0 0 300 300" aria-hidden="true">
            <defs>
              <linearGradient id="pgrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#79f2dc"/>
                <stop offset=".55" stop-color="#8b7bf7"/>
                <stop offset="1" stop-color="#f7a9c9"/>
              </linearGradient>
            </defs>
            <circle class="bo__track" cx="150" cy="150" r="138"/>
            <circle class="bo__ring" cx="150" cy="150" r="138"/>
          </svg>
          <div class="bo__scale"><div class="bo__body"></div></div>
          <div class="bo__content">
            <span class="bo__phase" id="boPhase">Ready?</span>
            <span class="bo__count" id="boCount">∞</span>
            <span class="bo__hint" id="boHint">${hint}</span>
          </div>
        </div>

        <div class="breath-controls">
          <button class="btn btn--primary btn--wide" id="breathToggle">
            <span id="breathToggleLabel">Begin</span>
            <svg viewBox="0 0 24 24" class="ico" id="breathToggleIcon"><use href="#i-play"/></svg>
            <span class="btn__ripple"></span>
          </button>
          <button class="btn btn--icon" id="breathReset" aria-label="Reset breathing session" title="Reset">
            <svg viewBox="0 0 24 24" class="ico"><use href="#i-reset"/></svg>
          </button>
        </div>

        <div class="breath-stats">
          <div><b id="statCycles">0</b><span>cycles</span></div>
          <div><b id="statTime">0:00</b><span>elapsed</span></div>
          <div><b id="statRhythm">4·4·4·4</b><span>rhythm</span></div>
        </div>
      </div>`;

const patternBtn = (o) => `          <button class="pattern${o.active ? ' is-active' : ''}" role="tab" aria-selected="${!!o.active}"
            data-name="${o.name}"
            data-desc="${o.desc}"
            data-in="${o.in}" data-holdin="${o.hi}" data-out="${o.out}" data-holdout="${o.ho}"${o.topup ? ` data-topup="${o.topup}"` : ''}>
            <span class="pattern__index">${o.idx}</span>
            <span class="pattern__body">
              <span class="pattern__name">${o.title}</span>
              <span class="pattern__meta">${o.meta}</span>
            </span>
            <span class="pattern__bar"><i></i></span>
          </button>`;

const SOUNDS = `
  <section class="section sounds" id="sounds">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Ambient layers</p>
      <h2 class="section__title reveal">Soundscapes that <em>hold</em> you</h2>
      <p class="section__lead reveal">Blend gentle layers into your own atmosphere. Everything is generated live — no loops, no repeats.</p>
    </div>

    <div class="sounds__grid">
      <article class="sound-card reveal" data-sound="rain">
        <div class="sound-card__art art--rain">
          <svg viewBox="0 0 200 140" aria-hidden="true">
            <g class="rain-lines">
              <line x1="30" y1="10" x2="22" y2="40"/><line x1="60" y1="0" x2="52" y2="30"/>
              <line x1="92" y1="14" x2="84" y2="44"/><line x1="124" y1="4" x2="116" y2="34"/>
              <line x1="156" y1="16" x2="148" y2="46"/><line x1="44" y1="60" x2="36" y2="90"/>
              <line x1="108" y1="56" x2="100" y2="86"/><line x1="170" y1="62" x2="162" y2="92"/>
            </g>
            <circle cx="100" cy="52" r="26" fill="none"/>
            <circle cx="100" cy="52" r="36" fill="none" opacity=".5"/>
          </svg>
        </div>
        <div class="sound-card__top">
          <h3>Soft Rain</h3>
          <button class="toggle" aria-label="Toggle Soft Rain" aria-pressed="false"><span></span></button>
        </div>
        <p>Window rain, distant and warm — the sound of thinking nothing.</p>
      </article>

      <article class="sound-card reveal" data-sound="ocean" data-delay="90">
        <div class="sound-card__art art--ocean">
          <svg viewBox="0 0 200 140" aria-hidden="true">
            <path class="wave w1" d="M0 90c25-18 45-18 70 0s45 18 70 0 45-18 60 0"/>
            <path class="wave w2" d="M0 105c25-18 45-18 70 0s45 18 70 0 45-18 60 0"/>
            <path class="wave w3" d="M0 120c25-18 45-18 70 0s45 18 70 0 45-18 60 0"/>
            <circle cx="150" cy="34" r="14" class="sun"/>
          </svg>
        </div>
        <div class="sound-card__top">
          <h3>Ocean Breath</h3>
          <button class="toggle" aria-label="Toggle Ocean Breath" aria-pressed="false"><span></span></button>
        </div>
        <p>Slow swells rolling in and out, forever, indifferent and kind.</p>
      </article>

      <article class="sound-card reveal" data-sound="forest" data-delay="180">
        <div class="sound-card__art art--forest">
          <svg viewBox="0 0 200 140" aria-hidden="true">
            <g class="trees">
              <path d="M40 120 60 60l20 60Z"/><path d="M70 120 96 40l26 80Z"/>
              <path d="M120 120 142 66l22 54Z"/><path d="M0 120 18 76l18 44Z"/>
            </g>
            <circle cx="150" cy="30" r="3" class="firefly"/><circle cx="36" cy="40" r="2" class="firefly"/>
            <circle cx="108" cy="26" r="2.5" class="firefly"/>
          </svg>
        </div>
        <div class="sound-card__top">
          <h3>Deep Forest</h3>
          <button class="toggle" aria-label="Toggle Deep Forest" aria-pressed="false"><span></span></button>
        </div>
        <p>Leaves, wind and the occasional bird. Breathe like the trees do.</p>
      </article>

      <article class="sound-card reveal" data-sound="singing-bowl" data-delay="270">
        <div class="sound-card__art art--bowl">
          <svg viewBox="0 0 200 140" aria-hidden="true">
            <path d="M60 74a40 40 0 0 0 80 0Z" class="bowl"/>
            <path d="M52 74h96" class="bowl-lip"/>
            <g class="ripples">
              <ellipse cx="100" cy="54" rx="34" ry="7"/><ellipse cx="100" cy="44" rx="50" ry="10" opacity=".6"/>
              <ellipse cx="100" cy="32" rx="66" ry="13" opacity=".3"/>
            </g>
          </svg>
        </div>
        <div class="sound-card__top">
          <h3>Singing Bowl</h3>
          <button class="toggle" aria-label="Toggle Singing Bowl" aria-pressed="false"><span></span></button>
        </div>
        <p>Harmonic drones tuned to the body. Let the overtones wash through.</p>
      </article>
    </div>

    <div class="sounds__status reveal">
      <span class="status__dot" id="audioDot"></span>
      <p id="audioStatus">Nothing playing — pick a layer above</p>
      <button class="btn btn--text" id="audioStop" hidden>Stop all</button>
    </div>
  </section>`;

/* ============================ breathing page ============================ */
const breathingPage = `
  <section class="page-hero">
    <div>
      <p class="breadcrumb reveal"><a href="index.html">Home</a><span>/</span>Breathing</p>
      <h1 class="page-hero__title reveal" data-delay="80">The <em>breathing</em> studio</h1>
      <p class="page-hero__lead reveal" data-delay="160">
        Five rhythms, each with its own character. Follow the light — expanding as you
        inhale, holding as you pause, settling as you release. Nothing to memorise, the orb leads.
      </p>
    </div>
    <div class="page-hero__aside">
      <div class="stat-pill reveal" data-delay="220"><span>Patterns included</span><b>5</b></div>
      <div class="stat-pill reveal" data-delay="300"><span>Typical cycle</span><b>12–19 s</b></div>
      <div class="stat-pill reveal" data-delay="380"><span>Best before</span><b>sleep or meetings</b></div>
    </div>
  </section>

  <nav class="subnav" aria-label="Breathing sections">
    <a href="#breathe" class="is-current">Guided breathing</a>
    <a href="#sounds">Soundscapes</a>
    <a href="#pranayama">Pranayama</a>
    <a href="#how">How it works</a>
  </nav>

  <section class="section breathe" id="breathe">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Guided breathwork</p>
      <h2 class="section__title reveal">Choose your <em>rhythm</em></h2>
      <p class="section__lead reveal">Each pattern is defined by counts: inhale · hold · exhale · (hold out). Start with four-four — it is the simplest place to begin.</p>
    </div>

    <div class="breath__grid">
      <div class="patterns reveal">
        <p class="patterns__label">Choose your rhythm</p>
        <div class="patterns__list" role="tablist" aria-label="Breathing patterns">
${[
    {
      idx: '01', title: '4–4 Equal Breath', name: '4–4 Equal Breath', show: '4–4', meta: '4 · 4', in: 4, hi: 0, out: 4, ho: 0,
      desc: 'Four in, four out. The gentlest starting point — even and steady, with no holds to remember.', active: true
    },
    {
      idx: '02', title: 'Box Breathing', name: 'Box Breathing', show: 'Box', meta: '4 · 4 · 4 · 4', in: 4, hi: 4, out: 4, ho: 4,
      desc: 'Four equal sides: inhale, hold, exhale, hold. Steady and grounding — a favourite of athletes and first responders.'
    },
    {
      idx: '03', title: '4–4–4 Calming', name: '4-4-4 Breath', show: '4-4-4', meta: '4 · 4 · 4', in: 4, hi: 4, out: 4, ho: 0,
      desc: 'In for four, hold for four, out for four. A short pause after the inhale that many people find easier than box breathing.'
    },
    {
      idx: '04', title: '4–7–8 Relax', name: '4–7–8 Relax', show: '4-7-8', meta: '4 · 7 · 8', in: 4, hi: 7, out: 8, ho: 0,
      desc: 'The famous relaxing breath. The long exhale signals safety to your nervous system — ideal before sleep.'
    },
    {
      idx: '05', title: '4 : 6 Sleep Breath', name: '4-6 Breath', show: '4:6', meta: '4 · 6', in: 4, hi: 0, out: 6, ho: 0,
      desc: 'Four in, six out. A 1:1.5 ratio that soothes the heart rate. Popular with singers, swimmers and anyone wound up before bed.'
    },
    {
      idx: '06', title: '4 : 8 Extended Exhale', name: '4-8 Breathing', show: '4:8', meta: '4 · 8', in: 4, hi: 0, out: 8, ho: 0,
      desc: 'Four in, eight out — a 1:2 ratio. A long, unforced exhale is the quickest lever for slowing a racing mind.'
    },
    {
      idx: '07', title: '5 : 5 Coherent', name: 'Coherent 5-5', show: '5:5', meta: '5 · 5', in: 5, hi: 0, out: 5, ho: 0,
      desc: 'About six breaths a minute, the pace where heart rate and breath often fall into resonance. Simple and deeply settling.'
    },
    {
      idx: '08', title: 'Physiological Sigh', name: 'Physiological Sigh', show: 'Sigh', meta: '2 · 2 · 6', in: 2, topup: 2, hi: 0, out: 6, ho: 0,
      desc: 'Two inhales through the nose, then one long exhale through the mouth. The fastest known way to lower stress in the moment.'
    }
  ].map((o) => patternBtn({
    ...o,
    desc: o.desc.replace(/"/g, '')
  })).join('\n')}
        </div>

        <div class="patterns__note">
          <svg viewBox="0 0 24 24" class="ico"><use href="#i-sparkle"/></svg>
          <p>Four in, four out. The gentlest starting point — even and steady, with no holds to remember.</p>
        </div>
      </div>

${breathWidget()}
    </div>
  </section>

${SOUNDS}

${pranayamaSection()}

  <section class="section" id="how">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> The method</p>
      <h2 class="section__title reveal">Three minutes, <em>every day</em></h2>
      <p class="section__lead reveal">Small and repeatable beats heroic and rare. Here is the whole practice.</p>
    </div>

    <div class="ritual__steps">
      <div class="step reveal">
        <div class="step__num">01</div>
        <h3>Settle</h3>
        <p>Sit comfortably. Let your shoulders drop. Nothing to fix, nowhere to be.</p>
      </div>
      <div class="step reveal" data-delay="120">
        <div class="step__num">02</div>
        <h3>Follow the light</h3>
        <p>Inhale as the orb grows, exhale as it returns. Your breath finds its pace.</p>
      </div>
      <div class="step reveal" data-delay="240">
        <div class="step__num">03</div>
        <h3>Return</h3>
        <p>Open your eyes slowly. Carry a fraction of that stillness into the hour.</p>
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="cta__ring" aria-hidden="true"></div>
    <div class="cta__inner reveal">
      <svg viewBox="0 0 48 48" class="cta__mark"><use href="#logo-mark"/></svg>
      <h2>Breath is the <em>remote control</em><br />of the nervous system.</h2>
      <p>Continue into sun salutations, tune your body with specific frequencies, or put on some music.</p>
      <a href="yoga.html" class="btn btn--primary">
        <span>Explore yoga</span><span class="btn__ripple"></span>
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg>
      </a>
    </div>
  </section>`;

/* ============================ pranayama (own five practices) ============================ */
function pranayamaSection() {
  return `
  <section class="section" id="pranayama">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Pranayama</p>
      <h2 class="section__title reveal">Three <em>breaths</em> to know</h2>
      <p class="section__lead reveal">Seated, spine tall, on an empty stomach. Press play to hear the rhythm of each one before you try it.</p>
    </div>

    <div class="prana-grid">
      <article class="card prana reveal">
        <div class="prana__head">
          <div>
            <h3>Kapalbhati</h3>
            <p class="prana__sanskrit">Skull-shining breath</p>
          </div>
          <span class="prana__icon"><svg viewBox="0 0 24 24"><use href="#i-leaf"></use></svg></span>
        </div>
        <p>Short, forceful exhales through both nostrils with passive inhales. A cleansing, energising practice that wakes up the abdomen.</p>
        <ol>
          <li>Sit tall, spine long, hands resting on the knees.</li>
          <li>Exhale sharply by pulling the belly in; let the inhale happen passively.</li>
          <li>Start with 20 pumps, rest, then another 20. Build slowly to 50.</li>
        </ol>
        <div class="prana__foot">
          <span>3 rounds · morning</span>
          <button class="prana__play" data-rhythm="kapalbhati"><svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg> Hear rhythm</button>
        </div>
      </article>

      <article class="card prana reveal" data-delay="100">
        <div class="prana__head">
          <div>
            <h3>Bhramari</h3>
            <p class="prana__sanskrit">Humming-bee breath</p>
          </div>
          <span class="prana__icon"><svg viewBox="0 0 24 24"><use href="#i-wave"></use></svg></span>
        </div>
        <p>Hum like a bee on the exhale with the ears gently closed. Instantly soothing for anxiety, restlessness and headaches.</p>
        <ol>
          <li>Close the ears with the thumbs and the eyes with the fingers.</li>
          <li>Inhale through the nose, then hum one long \u201cmmmm\u201d on the exhale.</li>
          <li>Repeat seven times, letting the sound fill the whole head.</li>
        </ol>
        <div class="prana__foot">
          <span>7 rounds · any time</span>
          <button class="prana__play" data-rhythm="bhramari"><svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg> Hear tone</button>
        </div>
      </article>

      <article class="card prana reveal" data-delay="200">
        <div class="prana__head">
          <div>
            <h3>Bhastrika</h3>
            <p class="prana__sanskrit">Bellows breath</p>
          </div>
          <span class="prana__icon"><svg viewBox="0 0 24 24"><use href="#i-flame"></use></svg></span>
        </div>
        <p>Equal, forceful inhales and exhales through the nose — like pumping air into a fire. Warming and activating; use with care.</p>
        <ol>
          <li>Sit comfortably with the back straight and shoulders relaxed.</li>
          <li>Breathe forcefully in and out through the nose, about one cycle per second.</li>
          <li>Do 10–20 breaths, then rest and breathe normally before the next round.</li>
        </ol>
        <div class="prana__foot">
          <span>3 rounds · build slowly</span>
          <button class="prana__play" data-rhythm="bhastrika"><svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg> Hear rhythm</button>
        </div>
      </article>
    </div>

    <div class="caution reveal">
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-alert"></use></svg>
      <p><strong style="font-weight:500">Take care.</strong> Skip forceful practices (kapalbhati, bhastrika) during pregnancy, or with high blood pressure, heart conditions, hernia, epilepsy or recent surgery. Stop immediately if you feel dizzy, and return to normal breathing. This is education, not medical advice.</p>
    </div>
  </section>`;
}

/* ============================ home page ============================ */
const homePage = `
  <section class="hero">
    <div class="hero__inner">
      <p class="eyebrow reveal">
        <span class="eyebrow__dot"></span> A sanctuary for your nervous system
      </p>

      <h1 class="hero__title">
        <span class="line"><span class="reveal-mask"><span>Inhale.</span></span></span>
        <span class="line"><span class="reveal-mask"><span>Exhale.</span></span></span>
        <span class="line accent"><span class="reveal-mask"><span>Arrive.</span></span></span>
      </h1>

      <p class="hero__sub reveal" data-delay="260">
        Sōma turns your breath into a door. Guided breathwork, sun salutations,
        healing frequencies and chakra meditation — one quiet place for all of it.
      </p>

      <div class="hero__actions reveal" data-delay="380">
        <a href="breathing.html" class="btn btn--primary">
          <span>Start breathing</span>
          <span class="btn__ripple"></span>
          <svg viewBox="0 0 24 24" class="ico"><use href="#i-play"/></svg>
        </a>
        <a href="#paths" class="btn btn--glass">
          <svg viewBox="0 0 24 24" class="ico"><use href="#i-lotus"/></svg>
          <span>Explore the site</span>
        </a>
      </div>

      <div class="hero__meta reveal" data-delay="520">
        <div class="meta__item"><strong data-count="124000" data-suffix="+">0</strong><span>breathers</span></div>
        <div class="meta__divider"></div>
        <div class="meta__item"><strong data-count="7" data-suffix="">0</strong><span>chakras</span></div>
        <div class="meta__divider"></div>
        <div class="meta__item"><strong data-count="12" data-suffix="">0</strong><span>surya poses</span></div>
      </div>
    </div>

    <div class="hero__visual" aria-hidden="true">
      <div class="orbit">
        <div class="orbit__ring orbit__ring--1"></div>
        <div class="orbit__ring orbit__ring--2"></div>
        <div class="orbit__ring orbit__ring--3"></div>
        <div class="orbit__dot orbit__dot--1"></div>
        <div class="orbit__dot orbit__dot--2"></div>
        <div class="orbit__dot orbit__dot--3"></div>
      </div>
      <div class="orb">
        <div class="orb__glow"></div>
        <div class="orb__core"></div>
        <div class="orb__ring"></div>
        <svg class="orb__mark" viewBox="0 0 48 48"><use href="#logo-mark"/></svg>
      </div>
      <div class="float-chip float-chip--a">
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-wind"/></svg>
        <div><b>4–7–8</b><small>Dr. Weil ritual</small></div>
      </div>
      <div class="float-chip float-chip--b">
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-sun"/></svg>
        <div><b>Surya Namaskar</b><small>12 steps</small></div>
      </div>
      <div class="float-chip float-chip--c">
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-flame"/></svg>
        <div><b>7 chakras</b><small>with timers</small></div>
      </div>
    </div>

    <a href="#paths" class="scroll-hint" aria-label="Scroll to explore">
      <span class="scroll-hint__line"></span><span>scroll</span>
    </a>
  </section>

  <div class="marquee" aria-hidden="true">
    <div class="marquee__track">
      <span>box breathing</span><i>✦</i><span>4–7–8</span><i>✦</i><span>4 : 6</span><i>✦</i><span>surya namaskar</span><i>✦</i><span>kapalbhati</span><i>✦</i><span>bhramari</span><i>✦</i><span>bhastrika</span><i>✦</i><span>528 hz</span><i>✦</i><span>chakras</span><i>✦</i>
      <span>box breathing</span><i>✦</i><span>4–7–8</span><i>✦</i><span>4 : 6</span><i>✦</i><span>surya namaskar</span><i>✦</i><span>kapalbhati</span><i>✦</i><span>bhramari</span><i>✦</i><span>bhastrika</span><i>✦</i><span>528 hz</span><i>✦</i><span>chakras</span><i>✦</i>
    </div>
  </div>

  <section class="section" id="paths">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Six doors in</p>
      <h2 class="section__title reveal">Where would you like to <em>begin</em>?</h2>
      <p class="section__lead reveal">Every practice has its own room. Choose the one your body is asking for today.</p>
    </div>

    <div class="paths">
      <a href="breathing.html" class="path-card reveal" style="--pc:rgba(121,242,220,.3); --pc-h:rgba(121,242,220,.85); --pcfg:#79f2dc">
        <span class="path-card__icon"><svg viewBox="0 0 24 24"><use href="#i-wind"/></svg></span>
        <h3>Breathing</h3>
        <p>Simple 4–4, box 4·4·4·4, 4–7–8 and the 4:6 sleep breath, plus kapalbhati, bhramari and bhastrika.</p>
        <span class="path-card__more">Enter the studio <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg></span>
      </a>

      <a href="yoga.html" class="path-card reveal" data-delay="90" style="--pc:rgba(247,232,196,.28); --pc-h:rgba(247,232,196,.8); --pcfg:#f7e8c4">
        <span class="path-card__icon"><svg viewBox="0 0 24 24"><use href="#i-sun"/></svg></span>
        <h3>Yoga</h3>
        <p>Surya Namaskar — all twelve steps with their Sanskrit names, breathing cues and mantras, plus a guided video.</p>
        <span class="path-card__more">Explore the practice <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg></span>
      </a>

      <a href="frequencies.html" class="path-card reveal" data-delay="180" style="--pc:rgba(139,123,247,.32); --pc-h:rgba(139,123,247,.9); --pcfg:#b4a6ff">
        <span class="path-card__icon"><svg viewBox="0 0 24 24"><use href="#i-wave"/></svg></span>
        <h3>Frequencies</h3>
        <p>Every Solfeggio tone and healing frequency from 174 Hz to 963 Hz, generated live in your browser — just press play.</p>
        <span class="path-card__more">Tune in <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg></span>
      </a>

      <a href="chakras.html" class="path-card reveal" data-delay="270" style="--pc:rgba(247,169,201,.28); --pc-h:rgba(247,169,201,.85); --pcfg:#f7a9c9">
        <span class="path-card__icon"><svg viewBox="0 0 24 24"><use href="#i-flame"/></svg></span>
        <h3>Chakras</h3>
        <p>Seven centres, seven colours, seven frequencies — each with its own tone and a meditation timer you set yourself.</p>
        <span class="path-card__more">Open the chakras <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg></span>
      </a>

      <a href="music.html" class="path-card reveal" data-delay="0" style="--pc:rgba(196,168,247,.3); --pc-h:rgba(196,168,247,.9); --pcfg:#d3c4ff">
        <span class="path-card__icon"><svg viewBox="0 0 24 24"><use href="#i-music"/></svg></span>
        <h3>Music</h3>
        <p>Hand-picked YouTube meditations — mantras, healing frequencies, chakra music and long ambient spaces to sit in.</p>
        <span class="path-card__more">Press play <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg></span>
      </a>

      <a href="journey.html" class="path-card reveal" data-delay="90" style="--pc:rgba(121,242,220,.26); --pc-h:rgba(121,242,220,.85); --pcfg:#79f2dc">
        <span class="path-card__icon"><svg viewBox="0 0 24 24"><use href="#i-heart"/></svg></span>
        <h3>Journey</h3>
        <p>Every minute you spend breathing, counted quietly — total time, daily streak and the rhythms you return to.</p>
        <span class="path-card__more">See your progress <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg></span>
      </a>
    </div>

    <div class="chakra-spectrum" aria-hidden="true">
      <i style="background:#ef4b4b"></i><i style="background:#f29a3d"></i><i style="background:#f5d34a"></i>
      <i style="background:#66c96b"></i><i style="background:#4aa3f0"></i><i style="background:#7d6bf0"></i><i style="background:#b978f2"></i>
    </div>
  </section>

  <section class="section voices" id="voices">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Voices</p>
      <h2 class="section__title reveal">Quiet words from the <em>community</em></h2>
    </div>

    <div class="voices__grid">
      <figure class="quote reveal">
        <svg viewBox="0 0 24 24" class="quote__mark"><use href="#i-quote"/></svg>
        <blockquote>I used to lie awake rehearsing tomorrow. Now I do four rounds of 4–7–8 and I'm simply… asleep. It feels like a small miracle.</blockquote>
        <figcaption><span class="avatar a1">M</span><div><b>Maya R.</b><small>Nightshift nurse</small></div></figcaption>
      </figure>
      <figure class="quote reveal" data-delay="100">
        <svg viewBox="0 0 24 24" class="quote__mark"><use href="#i-quote"/></svg>
        <blockquote>Surya Namaskar with the mantras changed my mornings. Twelve steps, ten minutes, and the whole day lands differently.</blockquote>
        <figcaption><span class="avatar a2">J</span><div><b>Jonah K.</b><small>Yoga teacher</small></div></figcaption>
      </figure>
      <figure class="quote reveal" data-delay="200">
        <svg viewBox="0 0 24 24" class="quote__mark"><use href="#i-quote"/></svg>
        <blockquote>No streaks, no notifications, no guilt. I play 528 Hz while I work and my jaw is no longer clenched by noon.</blockquote>
        <figcaption><span class="avatar a3">A</span><div><b>Amara O.</b><small>Product designer</small></div></figcaption>
      </figure>
    </div>
  </section>

  <section class="cta" id="about">
    <div class="cta__ring" aria-hidden="true"></div>
    <div class="cta__inner reveal">
      <svg viewBox="0 0 48 48" class="cta__mark"><use href="#logo-mark"/></svg>
      <h2>Your next breath<br /><em>can be a softer one.</em></h2>
      <p>Free, ad-free, and always here. One inhale is all it takes to begin.</p>
      <a href="breathing.html" class="btn btn--primary">
        <span>Begin now</span><span class="btn__ripple"></span>
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg>
      </a>
    </div>
  </section>`;

const out = [
  page({
    file: 'index.html',
    title: 'Sōma — Find Your Stillness',
    desc: 'A mindful breathing, yoga and chakra sanctuary. Guided breathwork, Surya Namaskar, healing frequencies and chakra meditation with gentle timers.',
    page: 'home',
    body: homePage,
    scripts: []
  }),
  page({
    file: 'breathing.html',
    title: 'Guided Breathing — Sōma',
    desc: 'Guided breathwork with a live breathing orb: simple 4–4, box breathing, 4–4 breath, 4–7–8 and the 4:6 sleep breath, plus ambient soundscapes.',
    page: 'breathing',
    body: breathingPage,
    scripts: ['assets/js/journey.js', 'assets/js/breath.js', 'assets/js/sounds.js', 'assets/js/pranayama.js']
  })
];

console.log(out.join('\n'));
