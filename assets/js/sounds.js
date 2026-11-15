/* =========================================================
   SŌMA — ambient soundscapes
   Live synthesis (no audio files): rain, ocean, forest, bowl.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$ } = window.Soma;

  function initSounds() {
    const cards = $$('.sound-card');
    const statusDot = $('#audioDot');
    const statusEl = $('#audioStatus');
    const stopAll = $('#audioStop');
    if (!cards.length) return;

    const LABELS = {
      rain: 'Soft Rain',
      ocean: 'Ocean Breath',
      forest: 'Deep Forest',
      'singing-bowl': 'Singing Bowl'
    };

    let ctx = null;
    let master = null;
    let noiseBuf = null;
    const layers = {};

    function ensureCtx() {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      const shelf = ctx.createBiquadFilter();
      shelf.type = 'highshelf';
      shelf.frequency.value = 5200;
      shelf.gain.value = -6;
      master.connect(shelf);
      shelf.connect(ctx.destination);
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.8);
      return ctx;
    }

    function getNoise() {
      if (noiseBuf) return noiseBuf;
      const len = Math.floor(ctx.sampleRate * 3);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.2;
      }
      return noiseBuf;
    }

    function noiseSource() {
      const src = ctx.createBufferSource();
      src.buffer = getNoise();
      src.loop = true;
      return src;
    }

    function lfo(freq, depth, target) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      g.gain.value = depth;
      o.connect(g).connect(target);
      o.start();
      return o;
    }

    const builders = {
      rain() {
        const out = ctx.createGain();
        out.gain.value = 0;
        out.connect(master);

        const n = noiseSource();
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 900;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 7200; lp.Q.value = 0.5;
        n.connect(hp).connect(lp).connect(out);

        const drop = ctx.createGain();
        drop.gain.value = 0;
        drop.connect(master);
        const dn = noiseSource();
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 6;
        dn.connect(bp).connect(drop);

        n.start(); dn.start();
        out.gain.setTargetAtTime(0.28, ctx.currentTime, 1.2);
        return {
          gain: out,
          stop() { try { n.stop(); dn.stop(); } catch (e) {} }
        };
      },

      ocean() {
        const out = ctx.createGain();
        out.gain.value = 0;
        out.connect(master);

        const n = noiseSource();
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.7;
        const swell = ctx.createGain();
        swell.gain.value = 0.5;
        n.connect(lp).connect(swell).connect(out);

        const l1 = lfo(0.08, 0.32, swell.gain);
        const l2 = lfo(0.045, 0.18, swell.gain);

        const body = ctx.createGain();
        body.gain.value = 0.22;
        body.connect(out);
        const sub = ctx.createOscillator();
        sub.type = 'sine'; sub.frequency.value = 58;
        sub.connect(body);

        n.start(); sub.start();
        out.gain.setTargetAtTime(0.42, ctx.currentTime, 1.6);
        return {
          gain: out,
          stop() { try { n.stop(); sub.stop(); l1.stop(); l2.stop(); } catch (e) {} }
        };
      },

      forest() {
        const out = ctx.createGain();
        out.gain.value = 0;
        out.connect(master);

        const n = noiseSource();
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.9;
        const g = ctx.createGain();
        g.gain.value = 0.16;
        n.connect(bp).connect(g).connect(out);
        const l = lfo(0.06, 0.09, g.gain);

        let birdTimer = null;
        const chirp = () => {
          if (!ctx) return;
          const o = ctx.createOscillator();
          const cg = ctx.createGain();
          o.type = 'sine';
          const base = 1800 + Math.random() * 1400;
          const t = ctx.currentTime;
          o.frequency.setValueAtTime(base, t);
          o.frequency.exponentialRampToValueAtTime(base * 1.6, t + 0.08);
          o.frequency.exponentialRampToValueAtTime(base * 1.1, t + 0.18);
          cg.gain.setValueAtTime(0, t);
          cg.gain.linearRampToValueAtTime(0.035, t + 0.02);
          cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
          o.connect(cg).connect(out);
          o.start(t); o.stop(t + 0.34);
          birdTimer = setTimeout(chirp, 1600 + Math.random() * 5200);
        };
        n.start();
        birdTimer = setTimeout(chirp, 1200);
        out.gain.setTargetAtTime(0.34, ctx.currentTime, 1.4);
        return {
          gain: out,
          stop() { clearTimeout(birdTimer); try { n.stop(); l.stop(); } catch (e) {} }
        };
      },

      'singing-bowl'() {
        const out = ctx.createGain();
        out.gain.value = 0;
        out.connect(master);

        const freqs = [110, 165, 220.5, 329.6, 440];
        const gains = [0.16, 0.1, 0.075, 0.04, 0.022];
        const oscs = [];
        freqs.forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = i % 2 ? 'triangle' : 'sine';
          o.frequency.value = f;
          o.detune.value = (Math.random() - 0.5) * 8;
          g.gain.value = 0;
          g.gain.setTargetAtTime(gains[i], ctx.currentTime + i * 0.35, 2.2);
          o.connect(g).connect(out);
          o.start();
          oscs.push(o, lfo(0.12 + i * 0.03, 0.6 + i * 0.2, o.detune));
        });

        let bellTimer = null;
        const strike = () => {
          if (!ctx) return;
          const t = ctx.currentTime;
          [[523.25, 0.05, 7], [1046.5, 0.015, 4]].forEach(([f, vol, dur]) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = f;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g).connect(out);
            o.start(t); o.stop(t + dur);
          });
          bellTimer = setTimeout(strike, 15000 + Math.random() * 6000);
        };
        bellTimer = setTimeout(strike, 800);

        out.gain.setTargetAtTime(0.38, ctx.currentTime, 1.8);
        return {
          gain: out,
          stop() { clearTimeout(bellTimer); oscs.forEach((o) => { try { o.stop(); } catch (e) {} }); }
        };
      }
    };

    function updateStatus() {
      const on = Object.keys(layers);
      if (on.length) {
        statusDot.classList.add('is-live');
        statusEl.textContent = 'Playing — ' + on.map((k) => LABELS[k]).join(' + ');
        stopAll.hidden = false;
      } else {
        statusDot.classList.remove('is-live');
        statusEl.textContent = 'Nothing playing — pick a layer above';
        stopAll.hidden = true;
      }
      cards.forEach((c) => {
        const isOn = !!layers[c.dataset.sound];
        c.classList.toggle('is-on', isOn);
        $('.toggle', c).setAttribute('aria-pressed', String(isOn));
      });
    }

    function toggleSound(card) {
      const key = card.dataset.sound;
      const C = ensureCtx();
      if (!C) { statusEl.textContent = 'Your browser does not support audio'; return; }
      if (C.state === 'suspended') C.resume();

      if (layers[key]) {
        const l = layers[key];
        l.gain.gain.setTargetAtTime(0, C.currentTime, 0.5);
        setTimeout(() => {
          try { l.node.stop(); } catch (e) {}
          l.gain.disconnect();
        }, 1200);
        delete layers[key];
      } else {
        const built = builders[key]();
        layers[key] = { gain: built.gain, node: built };
      }
      updateStatus();
    }

    cards.forEach((card) => {
      $('.toggle', card).addEventListener('click', (e) => { e.stopPropagation(); toggleSound(card); });
      card.addEventListener('click', (e) => {
        if (e.target.closest('.toggle')) return;
        toggleSound(card);
      });
    });

    stopAll.addEventListener('click', () => {
      cards.slice().forEach((c) => { if (layers[c.dataset.sound]) toggleSound(c); });
    });

    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend();
      else if (Object.keys(layers).length) ctx.resume();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSounds);
  else initSounds();
})();
