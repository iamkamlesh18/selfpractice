/* =========================================================
   builds yoga.html — physical practice only.
   Surya Namaskar is explained in text (no illustrations),
   with a verified video tutorial. Pranayama lives on the
   breathing page; exercises and a short flow stay here.
   ========================================================= */
const { page } = require('./shell');
const { SURYA } = require('./surya-data');

const stepRow = (s) => `
        <article class="sn-step reveal">
          <div class="sn-step__num">${String(s.n).padStart(2, '0')}</div>
          <div class="sn-step__main">
            <div class="sn-step__head">
              <div>
                <h3>${s.en}</h3>
                <p class="sn-step__sk">${s.sk}</p>
              </div>
              <div class="sn-step__badges">
                <span class="tag tag--gold">${s.breath}</span>
                <span class="tag tag--lilac">${s.chakra}</span>
              </div>
            </div>
            <p class="sn-step__does">${s.does}</p>
            <div class="sn-step__foot">
              <div class="sn-step__mantra">
                <span>Mantra</span>
                <b>${s.mantra}</b>
                <i>${s.meaning}</i>
              </div>
              <p class="sn-step__body">${s.body}</p>
            </div>
          </div>
        </article>`;

const body = `
  <section class="page-hero">
    <div>
      <p class="breadcrumb reveal"><a href="index.html">Home</a><span>/</span>Yoga</p>
      <h1 class="page-hero__title reveal" data-delay="80">Sun &amp; <em>breath</em>,<br />every morning.</h1>
      <p class="page-hero__lead reveal" data-delay="160">
        Surya Namaskar — the sun salutation — is twelve linked poses that carry you through
        one complete round of breath. Below is the full sequence with Sanskrit names, the mantra
        for each step, and what each pose asks of the body.
      </p>
    </div>
    <div class="page-hero__aside">
      <div class="stat-pill reveal" data-delay="220"><span>Poses per round</span><b>12</b></div>
      <div class="stat-pill reveal" data-delay="300"><span>Time per round</span><b>~60 s</b></div>
      <div class="stat-pill reveal" data-delay="380"><span>Classical rounds</span><b>12</b></div>
    </div>
  </section>

  <nav class="subnav" aria-label="Yoga sections">
    <a href="#surya-namaskar" class="is-current">Surya Namaskar</a>
    <a href="#mantras">Mantras</a>
    <a href="#watch">Watch</a>
    <a href="#exercises">Exercises</a>
    <a href="breathing.html#pranayama">Pranayama →</a>
  </nav>

  <section class="section" id="surya-namaskar">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> The sun salutation</p>
      <h2 class="section__title reveal">Twelve steps, <em>one breath</em></h2>
      <p class="section__lead reveal">
        Move on the breath: inhale to lengthen, exhale to fold and release, and hold the breath
        briefly at the eight-limbed salute. Two sets of twelve poses — right leg leading, then left —
        make one complete round.
      </p>
    </div>

    <div class="sn-key reveal">
      <div><span class="k k--in"></span><b>Inhale</b> — lengthen, lift, open</div>
      <div><span class="k k--out"></span><b>Exhale</b> — fold, lower, release</div>
      <div><span class="k k--hold"></span><b>Hold</b> — stay still, stay soft</div>
    </div>

    <div class="sn-list">
${SURYA.map(stepRow).join('\n')}
    </div>

    <div class="sn-rounds reveal">
      <span>Build up slowly</span>
      <b>3 · 6 · 12</b>
      <span>rounds over several weeks. Practise on an empty stomach, at least two hours after a meal, and never strain a joint to reach a shape.</span>
    </div>
  </section>

  <section class="section" id="mantras">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Chant with the pose</p>
      <h2 class="section__title reveal">The twelve <em>mantras</em></h2>
      <p class="section__lead reveal">Six are salutations and six are names of the sun. Chant them aloud or silently to the rhythm of your breath.</p>
    </div>

    <div class="mantra-grid">
      ${SURYA.map((s, i) => `
      <div class="mantra reveal" data-delay="${(i % 4) * 60}">
        <span class="mantra__n">${s.n}</span>
        <div>
          <b>${s.mantra}</b>
          <i>${s.meaning}</i>
          <small>${s.sk}</small>
        </div>
      </div>`).join('')}
    </div>
  </section>

  <section class="section" id="watch">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Watch the sequence</p>
      <h2 class="section__title reveal">Follow along <em>once</em></h2>
      <p class="section__lead reveal">A guided walkthrough from The Art of Living. Watching the transition between poses once is worth ten paragraphs of description.</p>
    </div>

    <div class="video-frame reveal">
      <iframe
        src="https://www.youtube-nocookie.com/embed/IKzkc3FWx7g?rel=0"
        title="Surya Namaskar — steps for beginners, guided walkthrough by The Art of Living"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen></iframe>
    </div>
    <p class="video-credit reveal">
      Video: <a href="https://www.youtube.com/watch?v=IKzkc3FWx7g" target="_blank" rel="noopener noreferrer">Surya Namaskar (Sun Salutation) Steps for Beginners</a>
      — The Art of Living. Sequence and mantras referenced from
      <a href="https://www.artofliving.org/in-en/yoga/yoga-poses/sun-salutation" target="_blank" rel="noopener noreferrer">Art of Living's Sun Salutation guide</a>
      and <a href="https://en.wikipedia.org/wiki/Sun_Salutation" target="_blank" rel="noopener noreferrer">Wikipedia</a>.
    </p>
  </section>
  <section class="section" id="exercises">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Supportive movement</p>
      <h2 class="section__title reveal">Simple <em>exercises</em></h2>
      <p class="section__lead reveal">Short mobility work that prepares the body for practice — and undoes a day at a desk.</p>
    </div>

    <div class="ex-grid">
      <article class="card ex reveal">
        <div class="ex__top">
          <span class="ex__badge"><svg viewBox="0 0 24 24"><use href="#i-sun"></use></svg></span>
          <div><h3>Neck &amp; shoulder rolls</h3><span class="ex__level">2 min · gentle</span></div>
        </div>
        <p>Slow half-circles with the chin, then ten shoulder rolls each way. Release the neck before any backbend.</p>
      </article>

      <article class="card ex reveal" data-delay="100">
        <div class="ex__top">
          <span class="ex__badge"><svg viewBox="0 0 24 24"><use href="#i-heart"></use></svg></span>
          <div><h3>Cat–cow flow</h3><span class="ex__level">2 min · spine</span></div>
        </div>
        <p>On hands and knees, alternate rounding and arching the spine with the breath. Ten slow cycles.</p>
      </article>

      <article class="card ex reveal" data-delay="200">
        <div class="ex__top">
          <span class="ex__badge"><svg viewBox="0 0 24 24"><use href="#i-brain"></use></svg></span>
          <div><h3>Tadasana — mountain</h3><span class="ex__level">1 min · balance</span></div>
        </div>
        <p>Stand tall, feet together, arms by the sides. Lengthen the crown, breathe slowly, feel yourself grounded.</p>
      </article>

      <article class="card ex reveal" data-delay="100">
        <div class="ex__top">
          <span class="ex__badge"><svg viewBox="0 0 24 24"><use href="#i-lotus"></use></svg></span>
          <div><h3>Seated twist</h3><span class="ex__level">1 min · each side</span></div>
        </div>
        <p>Cross-legged, hand on the opposite knee, exhale and rotate. Wrings out the spine after sitting.</p>
      </article>

      <article class="card ex reveal" data-delay="200">
        <div class="ex__top">
          <span class="ex__badge"><svg viewBox="0 0 24 24"><use href="#i-wind"></use></svg></span>
          <div><h3>Ankle &amp; wrist circles</h3><span class="ex__level">1 min · joints</span></div>
        </div>
        <p>Ten slow circles each ankle and wrist. Small movement that makes the forward fold and plank kind.</p>
      </article>

      <article class="card ex reveal" data-delay="300">
        <div class="ex__top">
          <span class="ex__badge"><svg viewBox="0 0 24 24"><use href="#i-moon"></use></svg></span>
          <div><h3>Legs up the wall</h3><span class="ex__level">5 min · rest</span></div>
        </div>
        <p>Lie with the hips near a wall and legs vertical. Exhale slowly — the perfect way to close a session.</p>
      </article>
    </div>

    <div class="caution reveal">
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-alert"></use></svg>
      <p><strong style="font-weight:500">Take care.</strong> Skip inversions, deep backbends and the eight-limbed salute during pregnancy, or with high blood pressure, recent surgery or acute back, wrist or shoulder injury. Work with a qualified teacher in person when you can. This is education, not medical advice.</p>
    </div>
  </section>

  <section class="cta">
    <div class="cta__ring" aria-hidden="true"></div>
    <div class="cta__inner reveal">
      <svg viewBox="0 0 48 48" class="cta__mark"><use href="#logo-mark"></use></svg>
      <h2>Pranayama has<br /><em>its own room.</em></h2>
      <p>Kapalbhati, bhramari and bhastrika now live on the breathing page, with guided sounds and safety notes.</p>
      <a href="breathing.html#pranayama" class="btn btn--primary">
        <span>Open pranayama</span><span class="btn__ripple"></span>
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"></use></svg>
      </a>
    </div>
  </section>`;

console.log(page({
  file: 'yoga.html',
  title: 'Yoga — Surya Namaskar — Sōma',
  desc: 'Surya Namaskar explained step by step: the twelve poses with Sanskrit names, breathing cues, chakra focus and the mantra for each step, plus a guided video and supportive exercises.',
  page: 'yoga',
  body,
  scripts: ['assets/js/yoga.js']
}));
