# Sōma — a quiet place to breathe

A static, dependency-free meditation site: guided breathing, Surya Namaskar with mantras,
pranayama, healing frequencies and chakra meditation with per-chakra timers.

Everything (sounds, tones, art, particles) is generated in the browser — no external images,
audio files or trackers. Fonts come from Google Fonts, with a graceful system fallback.

## Pages

| Page | What it holds |
|---|---|
| `index.html` | Home — hero, the four practice paths, voices |
| `breathing.html` | **Everything breath-related**: Simple 4–4, Box 4·4·4·4, 4–4, 4–7–8, 4:6 with a live orb, ambient soundscapes, and Kapalbhati / Bhramari / Bhastrika pranayama |
| `yoga.html` | Surya Namaskar as text only: 12 steps with Sanskrit names, breathing cues, chakra focus and the mantra for each step, a verified video tutorial, and exercises |
| `frequencies.html` | Every Solfeggio tone (174–963 Hz) plus planetary and healing tones, each playable |
| `chakras.html` | 7 chakras with true colours, yantra art, frequencies and a 2–30 minute timer per chakra |
| `music.html` | Hand-picked YouTube meditations (mantra, frequencies, chakra, sleep, ambient) with an in-page player |

## Structure

```
index.html  breathing.html  yoga.html  frequencies.html  chakras.html
styles.css                     ← one stylesheet for the whole site
assets/
  js/site.js                   ← shared: nav, reveals, stars, counters
  js/ambient.js                ← shared audio engine + floating dock (all pages)
  js/breath.js  sounds.js      ← breathing page
  js/pranayama.js              ← pranayama sound previews
  js/yoga.js                   ← yoga page sub-nav
  js/frequencies.js            ← frequencies page filters
  js/chakra.js                 ← chakra page
  js/music.js                  ← music page (filters + YouTube player)
  audio/spiritual-ambient.ogg  ← CC BY 4.0 track (see credits below)
  partials/sprite.svg          ← shared icon/logo sprite (inlined at build time)
_build/
  shell.js                     ← shared head / nav / footer template
  surya-data.js                ← the 12 poses, mantras and meanings
  pages-*.js                   ← one generator per page
  build.js                     ← regenerates all pages
  check-links.js               ← verifies links, anchors, symbols and duplicate ids
.github/workflows/deploy.yml   ← GitHub Pages deployment
```

### Editing content

The HTML pages are generated from `_build/` so the nav and footer stay identical everywhere.
Change a page's content in its `_build/pages-*.js` file, then run:

```bash
node _build/build.js
node _build/check-links.js
```

If you prefer editing the HTML directly, that works too — just keep the nav/footer blocks in sync.

## Deploying

Pushing to `main` runs the workflow and publishes the site to GitHub Pages.

One-time setup in the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
After that, every push to `main` deploys automatically.

> Sound and frequency practices here are educational and contemplative, not medical treatment.
> Skip forceful breathwork during pregnancy or with cardiovascular conditions.

## Credits

Ambient track: “Spiritual Ambient” by
[MusicLFiles](https://commons.wikimedia.org/wiki/Category:Files_by_MusicLFiles),
licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Source: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Spiritual_Ambient_by_MusicLFiles.ogg).
Changes: looped and volume-adjusted for background listening.

The CC BY licence requires this attribution to stay visible wherever the track is
used — it appears on every page footer and must not be removed without also
removing the audio file.
