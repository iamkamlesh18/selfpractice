/* builds chakras.html — 7 chakras, colours, yantra art, frequency + per-chakra timer */
const { page } = require('./shell');

/* Each chakra: colour, Sanskrit glyph (Devanagari), petals, element, freq, note */
const CHAKRAS = [
  {
    key: 'root', n: 1, name: 'Muladhara', en: 'Root Chakra', color: '#ef4b4b', dark: '#7d1d1d',
    petals: 4, element: 'Earth', sense: 'Smell', freq: 396, note: 'C', seed: 'लं',
    body: 'The base of the spine. Safety, survival, belonging and the feeling of being held by the ground.',
    imbalance: 'Fear, scarcity, restlessness',
    balanced: 'Grounded, secure, steady',
    glyph: 'Lam', region: 'Base of spine'
  },
  {
    key: 'sacral', n: 2, name: 'Svadhisthana', en: 'Sacral Chakra', color: '#f29a3d', dark: '#8a4b0c',
    petals: 6, element: 'Water', sense: 'Taste', freq: 417, note: 'D', seed: 'वं',
    body: 'Just below the navel. Pleasure, creativity, emotion and the freedom to feel and to flow.',
    imbalance: 'Numbness, guilt, rigidity',
    balanced: 'Creative, sensual, at ease',
    glyph: 'Vam', region: 'Below the navel'
  },
  {
    key: 'solar', n: 3, name: 'Manipura', en: 'Solar Plexus', color: '#f5d34a', dark: '#8a6f0c',
    petals: 10, element: 'Fire', sense: 'Sight', freq: 528, note: 'E', seed: 'रं',
    body: 'Above the navel. Willpower, confidence, digestion of food and of life itself.',
    imbalance: 'Shame, people-pleasing, burnout',
    balanced: 'Confident, purposeful, warm',
    glyph: 'Ram', region: 'Upper abdomen'
  },
  {
    key: 'heart', n: 4, name: 'Anahata', en: 'Heart Chakra', color: '#66c96b', dark: '#2a6e2e',
    petals: 12, element: 'Air', sense: 'Touch', freq: 639, note: 'F', seed: 'यं',
    body: 'The centre of the chest. Love, compassion, connection — the bridge between the lower and upper centres.',
    imbalance: 'Grief, jealousy, walls',
    balanced: 'Loving, forgiving, open',
    glyph: 'Yam', region: 'Heart'
  },
  {
    key: 'throat', n: 5, name: 'Vishuddha', en: 'Throat Chakra', color: '#4aa3f0', dark: '#1b5285',
    petals: 16, element: 'Ether', sense: 'Hearing', freq: 741, note: 'G', seed: 'हं',
    body: 'The throat. Truth, expression, speaking what is real and listening with the same care.',
    imbalance: 'Silence, lies, fear of speaking',
    balanced: 'Honest, articulate, listened to',
    glyph: 'Ham', region: 'Throat'
  },
  {
    key: 'thirdEye', n: 6, name: 'Ajna', en: 'Third Eye', color: '#7d6bf0', dark: '#332a8f',
    petals: 2, element: 'Light', sense: 'Intuition', freq: 852, note: 'A', seed: 'ॐ',
    body: 'Between the eyebrows. Insight, imagination, the quiet knowing that arrives before thinking does.',
    imbalance: 'Overthinking, fog, denial',
    balanced: 'Clear, intuitive, imaginative',
    glyph: 'Om', region: 'Brow'
  },
  {
    key: 'crown', n: 7, name: 'Sahasrara', en: 'Crown Chakra', color: '#b978f2', dark: '#5a2a8f',
    petals: 1000, element: 'Thought', sense: 'Unity', freq: 963, note: 'B', seed: 'ॐ',
    body: 'Above the crown of the head. Oneness, connection to something larger, pure consciousness.',
    imbalance: 'Disconnection, spiritual bypassing',
    balanced: 'Peaceful, expansive, connected',
    glyph: 'Silence', region: 'Crown of head'
  }
];

/* ---------- yantra art generator (petals + triangle + seed glyph) ---------- */
function petals(n, r) {
  const count = n >= 1000 ? 24 : n;       // crown's 1000 petals drawn as a full rosette
  let out = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const x = 100 + Math.cos(a) * r;
    const y = 100 + Math.sin(a) * r;
    const rot = (a * 180) / Math.PI + 90;
    out += `<ellipse class="petal" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="11" ry="20"
      transform="rotate(${rot.toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})"/>`;
  }
  return out;
}

function chakraSvg(c) {
  const inner = c.petals >= 1000 ? 62 : c.petals >= 12 ? 64 : 58;
  const text = c.seed;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${c.en} yantra">
    <circle class="petal" cx="100" cy="100" r="86" fill="none" opacity=".35"/>
    ${petals(c.petals, inner)}
    <circle class="petal" cx="100" cy="100" r="36" fill="none"/>
    <path class="petal" d="M100 62 118 132 82 132Z" fill="none"/>
    <path class="petal" d="M100 138 82 68 118 68Z" fill="none" opacity=".6"/>
    <circle class="core" cx="100" cy="100" r="26"/>
    <text x="100" y="110" text-anchor="middle" class="glyph-text" style="font-size:26px">${text}</text>
  </svg>`;
}

const listItem = (c) => `
          <button class="chakra-item${c.n === 1 ? ' is-active' : ''}" role="tab" aria-selected="${c.n === 1}"
            data-chakra="${c.key}" style="--cc:${c.color}">
            <span class="chakra-item__swatch"><svg viewBox="0 0 24 24"><use href="#i-lotus"/></svg></span>
            <span class="chakra-item__text">
              <b>${c.en}</b>
              <small>${c.n} · ${c.name}</small>
            </span>
            <span class="chakra-item__hz">${c.freq}<small>Hz</small></span>
          </button>`;

const body = `
  <section class="page-hero" style="--cc:#ef4b4b">
    <div>
      <p class="breadcrumb reveal"><a href="index.html">Home</a><span>/</span>Chakras</p>
      <h1 class="page-hero__title reveal" data-delay="80">Seven centres,<br /><em>seven colours.</em></h1>
      <p class="page-hero__lead reveal" data-delay="160">
        Choose a chakra, feel its colour, hear its frequency and set a timer for as long as
        you like. Each centre has its own tone and its own quality of attention.
      </p>
    </div>
    <div class="page-hero__aside">
      <div class="stat-pill reveal" data-delay="220"><span>Centres</span><b>7</b></div>
      <div class="stat-pill reveal" data-delay="300"><span>Frequency range</span><b>396–963 Hz</b></div>
      <div class="stat-pill reveal" data-delay="380"><span>Timer</span><b>1–30 min</b></div>
    </div>
  </section>

  <nav class="subnav" aria-label="Chakra sections">
    <a href="#meditate" class="is-current">Chakra meditation</a>
    <a href="#map">Colour map</a>
    <a href="#how">How to practise</a>
    <a href="frequencies.html">All frequencies →</a>
  </nav>

  <section class="section" id="meditate">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Chakra meditation</p>
      <h2 class="section__title reveal">Sit with a <em>colour</em></h2>
      <p class="section__lead reveal">Pick a centre on the left. Set your minutes, press begin — the tone and the timer run together.</p>
    </div>

    <div class="chakra-layout">
      <div class="chakra-list reveal" role="tablist" aria-label="Chakras">
${CHAKRAS.map(listItem).join('\n')}
        <div class="chakra-spectrum" aria-hidden="true">
          ${CHAKRAS.map((c) => `<i style="background:${c.color}"></i>`).join('')}
        </div>
      </div>

      <div class="chakra-stage reveal" id="chakraStage" data-delay="120" style="--cc:#ef4b4b">
        <div class="chakra-stage__head">
          <div>
            <span class="chakra-stage__sk" id="ckSk">Mūlādhāra · 1</span>
            <h3 class="chakra-stage__title" id="ckTitle">Root <em>Chakra</em></h3>
          </div>
          <span class="tag" id="ckElement" style="color:#ef4b4b;border-color:#ef4b4b55;background:#ef4b4b1a">Earth</span>
        </div>

        <div class="chakra-stage__body">
          <div class="chakra-art" id="ckArt" aria-hidden="true">
            <div class="chakra-art__halo"></div>
            <div class="chakra-art__rings"></div>
            ${chakraSvg(CHAKRAS[0]).replace(/style="[^"]*"/, '')}
          </div>

          <div class="chakra-facts">
            <p id="ckBody">${CHAKRAS[0].body}</p>
            <div class="chakra-rows">
              <div class="chakra-row"><span>Frequency</span><b class="hz" id="ckHz">396 Hz</b></div>
              <div class="chakra-row"><span>Note · Seed</span><b id="ckNote">C · Lam</b></div>
              <div class="chakra-row"><span>Location</span><b id="ckRegion">Base of spine</b></div>
              <div class="chakra-row"><span>Balanced</span><b id="ckBalanced">Grounded, secure, steady</b></div>
              <div class="chakra-row"><span>Out of balance</span><b id="ckImbalance" style="opacity:.75">Fear, scarcity, restlessness</b></div>
            </div>
          </div>
        </div>

        <div class="chakra-timer">
          <div class="chakra-timer__ring">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle class="trk" cx="32" cy="32" r="27"/>
              <circle class="prg" id="ckRing" cx="32" cy="32" r="27"/>
            </svg>
          </div>
          <div>
            <div class="chakra-timer__time" id="ckTime">05:00</div>
          </div>
          <div class="chakra-timer__chips" role="group" aria-label="Timer length">
            <button class="chip" data-min="2">2</button>
            <button class="chip is-active" data-min="5">5</button>
            <button class="chip" data-min="10">10</button>
            <button class="chip" data-min="15">15</button>
            <button class="chip" data-min="20">20</button>
            <button class="chip" data-min="30">30</button>
          </div>
          <button class="chakra-timer__go" id="ckGo">
            <svg viewBox="0 0 24 24" class="ico" id="ckGoIcon"><use href="#i-play"/></svg>
            <span id="ckGoLabel">Begin</span>
          </button>
        </div>

        <div class="chakra-note" id="ckNoteLive">
          <span class="dot-live"></span>
          <span id="ckLive">Tone off · timer idle</span>
          <button class="btn btn--text" id="ckTone" style="margin-left:auto">Play tone only</button>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="map">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> The map</p>
      <h2 class="section__title reveal">Colour <em>map</em></h2>
      <p class="section__lead reveal">From earth at the base to light at the crown. The classic seven-colour system, top to bottom.</p>
    </div>

    <div class="chakra-layout" style="grid-template-columns:1fr">
      <div class="ritual__steps" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
        ${CHAKRAS.slice().reverse().map((c, i) => `
        <div class="step reveal" data-delay="${i * 70}" style="border-color:${c.color}44;background:linear-gradient(175deg,${c.color}18,${c.color}06)">
          <div class="step__num" style="color:${c.color};opacity:.5">${c.n}</div>
          <div style="width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 34% 30%,#fff9,transparent 46%),${c.color};box-shadow:0 0 24px -2px ${c.color};margin-bottom:18px"></div>
          <h3 style="font-size:1.35rem">${c.en}</h3>
          <p style="color:${c.color};font-family:var(--font-display);font-style:italic;margin-bottom:6px">${c.name}</p>
          <p><b style="font-weight:400">${c.freq} Hz</b> · ${c.note} · ${c.element}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" id="how">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> The practice</p>
      <h2 class="section__title reveal">How to <em>practise</em></h2>
      <p class="section__lead reveal">Simple, unhurried, repeatable. Five minutes is a complete practice.</p>
    </div>

    <div class="ritual__steps">
      <div class="step reveal">
        <div class="step__num">01</div>
        <h3>Choose</h3>
        <p>Pick the centre that feels tight or tired — root when anxious, throat before speaking, heart when hurt.</p>
      </div>
      <div class="step reveal" data-delay="120">
        <div class="step__num">02</div>
        <h3>Sit &amp; see</h3>
        <p>Sit tall. Let the colour fill the screen. Breathe slowly in through the nose, out through the mouth.</p>
      </div>
      <div class="step reveal" data-delay="240">
        <div class="step__num">03</div>
        <h3>Listen</h3>
        <p>Play the tone and set the timer. Imagine the colour and the sound gathering at that centre.</p>
      </div>
      <div class="step reveal" data-delay="360">
        <div class="step__num">04</div>
        <h3>Release</h3>
        <p>When the bell rings, let it go. Notice what feels different before you open your eyes.</p>
      </div>
    </div>

    <div class="caution reveal">
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-alert"/></svg>
      <p><strong style="font-weight:500">A note.</strong> Chakra work is a contemplative tradition, not a medical treatment. If you carry significant trauma, practise gently or with a teacher you trust.</p>
    </div>
  </section>

  <section class="cta">
    <div class="cta__ring" aria-hidden="true"></div>
    <div class="cta__inner reveal">
      <svg viewBox="0 0 48 48" class="cta__mark"><use href="#logo-mark"/></svg>
      <h2>End with a <em>sun salutation</em>.</h2>
      <p>Movement before stillness — twelve poses to wake the body before you sit.</p>
      <a href="yoga.html#surya-namaskar" class="btn btn--primary">
        <span>Open Surya Namaskar</span><span class="btn__ripple"></span>
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg>
      </a>
    </div>
  </section>`;

/* Ship the chakra data to the page so chakra.js stays dumb */
const dataTag = `<script>window.SOMA_CHAKRAS = ${JSON.stringify(CHAKRAS)};</script>`;

console.log(page({
  file: 'chakras.html',
  title: 'Chakra Meditation — Sōma',
  desc: 'Meditate on the seven chakras with their true colours, yantra art and frequencies (396–963 Hz), plus a per-chakra timer you set from 2 to 30 minutes.',
  page: 'chakras',
  body: `${dataTag}\n${body}`,
  scripts: ['assets/js/chakra.js']
}));
