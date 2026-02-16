/* Web Audio API sound effects — no external files needed */
const SFX = (() => {
  let ctx = null;
  let muted = localStorage.getItem('ttrpg_mute') === '1';

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function play(fn) {
    if (muted) return;
    try { fn(getCtx()); } catch {}
  }

  function diceRoll() {
    play(ctx => {
      // Quick noise burst simulating dice clatter
      const dur = 0.15;
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / d.length);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = 2000;
      filt.Q.value = 1;
      const gain = ctx.createGain();
      gain.gain.value = 0.3;
      src.connect(filt).connect(gain).connect(ctx.destination);
      src.start();
    });
  }

  function critSuccess() {
    play(ctx => {
      // Rising fanfare: 3 quick ascending tones
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.25);
      });
    });
  }

  function critFail() {
    play(ctx => {
      // Descending low tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    });
  }

  function click() {
    play(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    });
  }

  function toggleMute() {
    muted = !muted;
    localStorage.setItem('ttrpg_mute', muted ? '1' : '0');
    return muted;
  }

  function isMuted() { return muted; }

  return { diceRoll, critSuccess, critFail, click, toggleMute, isMuted };
})();
