/* ============================================================
   SOUND MANAGER — Web Audio API, no external files needed
   ============================================================ */
const SoundManager = (() => {
  let ctx = null;
  let _muted = false;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, duration, gainVal = 0.25, delay = 0) {
    if (_muted) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
      gain.gain.setValueAtTime(0.001, ac.currentTime + delay);
      gain.gain.linearRampToValueAtTime(gainVal, ac.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
      osc.start(ac.currentTime + delay);
      osc.stop(ac.currentTime + delay + duration + 0.02);
    } catch (_) {}
  }

  function noise(duration, gainVal = 0.35, decay = 0.08) {
    if (_muted) return;
    try {
      const ac = getCtx();
      const bufLen = Math.ceil(ac.sampleRate * duration);
      const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * decay));
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      gain.gain.setValueAtTime(gainVal, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      src.start();
      src.stop(ac.currentTime + duration + 0.05);
    } catch (_) {}
  }

  return {
    get muted() { return _muted; },

    toggle() { _muted = !_muted; },

    play(sound) {
      if (_muted) return;
      switch (sound) {
        case 'reveal':
          tone(900, 'sine', 0.07, 0.12);
          break;

        case 'flag':
          tone(1400, 'triangle', 0.08, 0.18);
          tone(1100, 'triangle', 0.08, 0.14, 0.06);
          break;

        case 'explosion':
          noise(0.6, 0.5, 0.07);
          tone(80,  'sawtooth', 0.4, 0.3);
          tone(60,  'sine',     0.5, 0.25, 0.05);
          break;

        case 'win':
          // Ascending victory chime
          [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
            tone(f, 'sine', 0.35, 0.28, i * 0.13);
          });
          break;
      }
    }
  };
})();
