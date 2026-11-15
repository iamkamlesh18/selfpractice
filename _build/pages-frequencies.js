/* builds frequencies.html — all healing frequencies, playable */
const { page } = require('./shell');

const FREQS = [
  // --- Solfeggio ---
  {
    hz: 174, name: 'Foundation', solfeggio: true, c1: '#7de3c9', c2: '#3f9f8f',
    desc: 'Often called the "pain gate". Used to ease physical discomfort and create a sense of safety in the body.',
    use: 'Body · grounding'
  },
  {
    hz: 285, name: 'Restoration', solfeggio: true, c1: '#8fe0b8', c2: '#4a9c74',
    desc: 'Associated with tissue healing and returning tissue to its original form. A quiet, restoring tone.',
    use: 'Recovery · sleep onset'
  },
  {
    hz: 396, name: 'Liberation (UT)', solfeggio: true, c1: '#f0b07a', c2: '#c25a3f',
    desc: 'The first Solfeggio. Said to release guilt and fear, and to turn grief into courage.',
    use: 'Root · letting go'
  },
  {
    hz: 417, name: 'Change (RE)', solfeggio: true, c1: '#f2a86a', c2: '#c7682e',
    desc: 'The tone of undoing situations and facilitating change. Helpful when you feel stuck.',
    use: 'Sacral · momentum'
  },
  {
    hz: 528, name: 'Miracles (MI)', solfeggio: true, c1: '#7fe9c0', c2: '#2f9d78',
    desc: 'The most famous Solfeggio — "repairing DNA". Deeply loved for transformation and clarity.',
    use: 'Heart · healing'
  },
  {
    hz: 639, name: 'Connection (FA)', solfeggio: true, c1: '#f5b3d0', c2: '#c05788',
    desc: 'Rekindles harmony in relationships and reconnects you with the people who matter.',
    use: 'Heart · relationships'
  },
  {
    hz: 741, name: 'Expression (SOL)', solfeggio: true, c1: '#9fd6f5', c2: '#3f82b8',
    desc: 'The tone of awakening intuition and expressing what is true. Cleansing and clarifying.',
    use: 'Throat · expression'
  },
  {
    hz: 852, name: 'Intuition (LA)', solfeggio: true, c1: '#a9a8f5', c2: '#5148b8',
    desc: 'Returns you to spiritual order. Often used during deep meditation and stillness.',
    use: 'Third eye · clarity'
  },
  {
    hz: 963, name: 'Divine (SI)', solfeggio: true, c1: '#c9a4f7', c2: '#7a3fc0',
    desc: 'The purest Solfeggio tone — light, oneness and the sense of being connected to everything.',
    use: 'Crown · unity'
  },
  // --- Additional healing tones ---
  {
    hz: 432, name: 'Nature Tuning', c1: '#8ee4d6', c2: '#3d9c94',
    desc: 'Said to resonate with the natural world and the human heartbeat. Calm and earthy.',
    use: 'Ambient · tuning'
  },
  {
    hz: 440, name: 'Standard Pitch', c1: '#c9d2e4', c2: '#6c7893',
    desc: 'The modern concert pitch (A4). Useful as a reference and for tuning your instruments.',
    use: 'Reference · tuning'
  },
  { hz: 528, name: 'Love (variant)', c1: '#f7b8d4', c2: '#b64f86', skip: true },
  {
    hz: 40, name: 'Deep Delta', c1: '#6f7fd6', c2: '#2c356e',
    desc: 'Very low theta/delta range. Deep sleep, unconscious rest and physical recovery.',
    use: 'Sleep · recovery'
  },
  {
    hz: 96, name: 'Low Theta', c1: '#7f8ee0', c2: '#3a3f8f',
    desc: 'Slow brainwave territory. Dreamless rest and deep meditation.',
    use: 'Rest · meditation'
  },
  {
    hz: 136.1, name: 'Om / Earth', c1: '#d8c48a', c2: '#8a6d2f',
    desc: 'The "Earth year" tone — the frequency the Earth is said to orbit the sun. The sound of Om.',
    use: 'Grounding · chant'
  },
  {
    hz: 194.18, name: 'Earth Day', c1: '#cdbf94', c2: '#7c6a3c',
    desc: 'The "Earth day" tone, sometimes called the earth star frequency. Slow and stabilising.',
    use: 'Grounding'
  },
  {
    hz: 210.42, name: 'Synodic Moon', c1: '#b7b4cf', c2: '#5c587a',
    desc: 'Based on the lunar cycle. Reflective, gentle, good for evening practice.',
    use: 'Moon · evening'
  },
  {
    hz: 315.5, name: 'Mercury', c1: '#9fc4e8', c2: '#3f6f9e',
    desc: 'Planetary tone. Light, quick and communicative — good for clear thinking.',
    use: 'Focus · clarity'
  },
  { hz: 396, name: 'Mercury (day)', c1: '#9fc4e8', c2: '#3f6f9e', skip: true },
  {
    hz: 422.5, name: 'Venus', c1: '#f0b7c9', c2: '#a75f79',
    desc: 'Planetary tone of Venus. Warm, sweet and harmonising.',
    use: 'Heart · harmony'
  },
  {
    hz: 693, name: 'Mars', c1: '#e88a6a', c2: '#9c3c25',
    desc: 'Planetary tone of Mars. Vital and activating — use when you want energy.',
    use: 'Energy · drive'
  },
  { hz: 852, name: 'Earth (crown)', c1: '#c9a4f7', c2: '#7a3fc0', skip: true },
  {
    hz: 111, name: 'Cell Regeneration', c1: '#8fe6c6', c2: '#2f8f72',
    desc: 'A popular "cell regeneration" tone in sound-healing circles. Warm and bright.',
    use: 'Body · renewal'
  },
  { hz: 528, name: 'DNA Repair', c1: '#7fe9c0', c2: '#2f9d78', skip: true },
  { hz: 741, name: 'Detox / Cleanse', c1: '#9fd6f5', c2: '#3f82b8', skip: true },
  { hz: 285, name: 'Tissue Repair', c1: '#8fe0b8', c2: '#4a9c74', skip: true }
].filter((f) => !f.skip);

/* de-duplicate by hz + name and keep order */
const seen = new Set();
const LIST = FREQS.filter((f) => {
  const k = f.hz + f.name;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

const wave = (seed) => {
  const bars = 22;
  return Array.from({ length: bars }, (_, i) => {
    const h = 30 + Math.round(Math.abs(Math.sin((i + seed) * 0.55)) * 65);
    return `<i style="animation-delay:-${(i * 0.06 + (seed % 7) * 0.09).toFixed(2)}s;height:${h}%"></i>`;
  }).join('');
};

const card = (f, i) => `
      <article class="freq reveal" data-hz="${f.hz}" data-name="${f.name}" data-c1="${f.c1}" data-c2="${f.c2}" data-delay="${(i % 4) * 70}" style="--c1:${f.c1};--c2:${f.c2}">
        <div class="freq__top">
          <div>
            <div class="freq__hz">${f.hz}<small> Hz</small></div>
            <h3>${f.name}</h3>
            ${f.solfeggio ? '<span class="tag">Solfeggio</span>' : ''}
          </div>
        </div>
        <p>${f.desc}</p>
        <div class="freq__wave" aria-hidden="true">${wave(i + 1)}</div>
        <div class="freq__foot">
          <span class="freq__use">${f.use}</span>
          <button class="freq__play" aria-label="Play ${f.hz} hertz ${f.name}">
            <svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg> Play
          </button>
        </div>
      </article>`;

const body = `
  <section class="page-hero">
    <div>
      <p class="breadcrumb reveal"><a href="index.html">Home</a><span>/</span>Frequencies</p>
      <h1 class="page-hero__title reveal" data-delay="80">Every <em>frequency</em>,<br />one press away.</h1>
      <p class="page-hero__lead reveal" data-delay="160">
        The nine Solfeggio tones plus the most-loved planetary and healing frequencies.
        Each is generated live in your browser with a pure sine oscillator — nothing to download,
        nothing streaming in the background.
      </p>
    </div>
    <div class="page-hero__aside">
      <div class="stat-pill reveal" data-delay="220"><span>Frequencies</span><b>${LIST.length}</b></div>
      <div class="stat-pill reveal" data-delay="300"><span>Range</span><b>40–963 Hz</b></div>
      <div class="stat-pill reveal" data-delay="380"><span>Source</span><b>live synth</b></div>
    </div>
  </section>

  <nav class="subnav" aria-label="Frequency sections">
    <a href="#all">All frequencies</a>
    <a href="#solfeggio">Solfeggio</a>
    <a href="#healing">Healing &amp; planetary</a>
    <a href="chakras.html">By chakra →</a>
  </nav>

  <section class="section" id="all">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> The collection</p>
      <h2 class="section__title reveal">Tune <em>yourself</em></h2>
      <p class="section__lead reveal">Play one at a time — stacking very different frequencies at once is rarely pleasant. Volume lives in the player below.</p>
    </div>

    <div class="freq-toolbar reveal">
      <button class="chip is-active" data-filter="all">All</button>
      <button class="chip" data-filter="solfeggio">Solfeggio</button>
      <button class="chip" data-filter="healing">Healing &amp; planetary</button>
      <button class="chip" data-filter="high">500 Hz +</button>
      <button class="chip" data-filter="low">Under 300 Hz</button>
    </div>

    <div class="freq-grid" id="freqGrid">
${LIST.map(card).join('\n')}
    </div>

    <div class="freq-player reveal" id="freqPlayer" hidden>
      <svg viewBox="0 0 24 24" class="ico" style="width:22px;height:22px;color:var(--mint)"><use href="#i-volume"/></svg>
      <div class="freq-player__info">
        <b id="playerName">—</b>
        <span id="playerHz">—</span>
      </div>
      <input type="range" id="playerVol" min="0" max="100" value="35" aria-label="Volume" />
      <button class="btn btn--icon" id="playerStop" aria-label="Stop frequency" title="Stop">
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-stop"/></svg>
      </button>
    </div>

    <div class="caution reveal">
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-alert"/></svg>
      <p><strong style="font-weight:500">A gentle note.</strong> Frequency healing is a contemplative practice, not a medical treatment. Keep the volume low and stop if you feel uncomfortable. Never replace medical care with sound.</p>
    </div>
  </section>

  <section class="section" id="solfeggio">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> The nine</p>
      <h2 class="section__title reveal">The <em>Solfeggio</em> scale</h2>
      <p class="section__lead reveal">Nine tones thought to have been used in Gregorian chant, each mapped to a phrase from the hymn to St. John the Baptist.</p>
    </div>
    <div class="chakra-spectrum" style="max-width:none" aria-hidden="true">
      <i style="background:linear-gradient(90deg,#7de3c9,#3f9f8f)"></i>
      <i style="background:linear-gradient(90deg,#8fe0b8,#4a9c74)"></i>
      <i style="background:linear-gradient(90deg,#f0b07a,#c25a3f)"></i>
      <i style="background:linear-gradient(90deg,#f2a86a,#c7682e)"></i>
      <i style="background:linear-gradient(90deg,#7fe9c0,#2f9d78)"></i>
      <i style="background:linear-gradient(90deg,#f5b3d0,#c05788)"></i>
      <i style="background:linear-gradient(90deg,#9fd6f5,#3f82b8)"></i>
      <i style="background:linear-gradient(90deg,#a9a8f5,#5148b8)"></i>
      <i style="background:linear-gradient(90deg,#c9a4f7,#7a3fc0)"></i>
    </div>
    <div class="ritual__steps mt-l">
      ${LIST.filter((f) => f.solfeggio).map((f, i) => `
      <div class="step reveal" data-delay="${i * 60}">
        <div class="step__num">${f.hz}</div>
        <h3 style="font-size:1.3rem">${f.name}</h3>
        <p>${f.desc}</p>
      </div>`).join('')}
    </div>
  </section>

  <section class="section" id="healing">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Beyond the scale</p>
      <h2 class="section__title reveal">Planetary &amp; <em>healing</em> tones</h2>
      <p class="section__lead reveal">Earth, moon and planetary resonances, plus the much-loved 432 Hz nature tuning.</p>
    </div>
    <div class="freq-grid">
      ${LIST.filter((f) => !f.solfeggio).map(card).join('\n')}
    </div>
  </section>

  <section class="cta">
    <div class="cta__ring" aria-hidden="true"></div>
    <div class="cta__inner reveal">
      <svg viewBox="0 0 48 48" class="cta__mark"><use href="#logo-mark"/></svg>
      <h2>Each chakra has<br /><em>its own frequency.</em></h2>
      <p>Match a tone to a centre, set a timer, and sit with the colour for a few minutes.</p>
      <a href="chakras.html" class="btn btn--primary">
        <span>Begin chakra meditation</span><span class="btn__ripple"></span>
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"/></svg>
      </a>
    </div>
  </section>`;

console.log(page({
  file: 'frequencies.html',
  title: 'Healing Frequencies — Sōma',
  desc: 'All Solfeggio tones from 174 Hz to 963 Hz plus planetary and healing frequencies — each playable live in your browser with a gentle sine tone.',
  page: 'frequencies',
  body,
  scripts: ['assets/js/frequencies.js']
}));
