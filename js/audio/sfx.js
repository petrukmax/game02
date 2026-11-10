// Procedural sound effects with Web Audio. No music, no external assets.

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.noiseBuffer = null;
    this.unlocked = false;
    try {
      this.muted = localStorage.getItem('ashen-crown-muted') === '1';
    } catch {
      this.muted = false;
    }
  }

  ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.32;
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.makeNoise();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.unlocked = true;
    return true;
  }

  makeNoise() {
    const length = Math.floor(this.ctx.sampleRate * 1.2);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.32;
    try {
      localStorage.setItem('ashen-crown-muted', muted ? '1' : '0');
    } catch {
      // Storage is optional.
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  tone(freq, duration, options = {}) {
    const ctx = this.ctx;
    const when = ctx.currentTime + (options.delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = options.type || 'sine';
    osc.frequency.setValueAtTime(freq, when);
    if (options.endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, options.endFreq), when + duration);
    const volume = options.gain ?? 0.08;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    let node = osc;
    if (options.filter) {
      const filter = ctx.createBiquadFilter();
      filter.type = options.filter;
      filter.frequency.setValueAtTime(options.filterFreq || 900, when);
      node.connect(filter);
      node = filter;
    }
    node.connect(gain);
    gain.connect(this.master);
    osc.start(when);
    osc.stop(when + duration + 0.02);
    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Already disconnected.
      }
    };
  }

  noise(duration, options = {}) {
    const ctx = this.ctx;
    const when = ctx.currentTime + (options.delay || 0);
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = options.filter || 'lowpass';
    filter.frequency.setValueAtTime(options.freq || 1200, when);
    if (options.endFreq) filter.frequency.exponentialRampToValueAtTime(Math.max(40, options.endFreq), when + duration);
    filter.Q.value = options.q ?? 0.8;
    const gain = ctx.createGain();
    const volume = options.gain ?? 0.12;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(when);
    source.stop(when + duration + 0.02);
    source.onended = () => {
      try {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {
        // Already disconnected.
      }
    };
  }

  play(name, options = {}) {
    if (this.muted) return;
    if (!this.ensure()) return;
    if (this.ctx.state !== 'running') return;
    try {
      this.fire(name, options);
    } catch {
      // Sound is optional.
    }
  }

  fire(name, options = {}) {
    switch (name) {
      case 'click':
        this.tone(520, 0.06, { type: 'square', gain: 0.035, endFreq: 640 });
        break;
      case 'select':
        this.tone(700, 0.08, { type: 'triangle', gain: 0.05, endFreq: 880 });
        break;
      case 'invalid':
        this.tone(150, 0.16, { type: 'sawtooth', gain: 0.05, endFreq: 110 });
        break;
      case 'sword':
        this.noise(0.2, { filter: 'bandpass', freq: 2600, endFreq: 700, gain: 0.09, q: 1.2 });
        this.tone(220, 0.08, { type: 'triangle', gain: 0.02, endFreq: 160 });
        break;
      case 'bow':
        this.noise(0.16, { filter: 'highpass', freq: 1400, endFreq: 3200, gain: 0.06 });
        this.tone(320, 0.12, { type: 'triangle', gain: 0.04, endFreq: 180 });
        break;
      case 'fire':
        this.noise(0.5, { filter: 'lowpass', freq: 2200, endFreq: 260, gain: 0.14, q: 0.6 });
        this.tone(180, 0.4, { type: 'sawtooth', gain: 0.04, endFreq: 70 });
        break;
      case 'holy':
        this.tone(660, 0.5, { type: 'sine', gain: 0.06 });
        this.tone(990, 0.5, { type: 'sine', gain: 0.04, delay: 0.06 });
        this.tone(1320, 0.7, { type: 'sine', gain: 0.03, delay: 0.12 });
        break;
      case 'poison':
        this.noise(0.45, { filter: 'lowpass', freq: 700, endFreq: 180, gain: 0.11, q: 3 });
        this.tone(95, 0.3, { type: 'sine', gain: 0.035, endFreq: 60 });
        break;
      case 'hit':
        this.noise(0.16, { filter: 'lowpass', freq: 900, endFreq: 120, gain: options.crit ? 0.18 : 0.11 });
        this.tone(options.crit ? 90 : 120, 0.16, { type: 'square', gain: options.crit ? 0.09 : 0.055, endFreq: 50 });
        if (options.crit) this.tone(1400, 0.12, { type: 'triangle', gain: 0.04, endFreq: 600 });
        break;
      case 'heal':
        this.tone(523, 0.25, { type: 'sine', gain: 0.045 });
        this.tone(659, 0.3, { type: 'sine', gain: 0.04, delay: 0.08 });
        this.tone(784, 0.4, { type: 'sine', gain: 0.035, delay: 0.16 });
        break;
      case 'shield':
        this.tone(300, 0.25, { type: 'triangle', gain: 0.05, endFreq: 620 });
        this.noise(0.2, { filter: 'highpass', freq: 1200, gain: 0.03 });
        break;
      case 'death':
        this.tone(180, 0.6, { type: 'sawtooth', gain: 0.05, endFreq: 50, filter: 'lowpass', filterFreq: 600 });
        this.noise(0.4, { filter: 'lowpass', freq: 500, endFreq: 90, gain: 0.06 });
        break;
      case 'round':
        this.tone(70, 0.5, { type: 'sine', gain: 0.07, endFreq: 45 });
        this.tone(140, 0.3, { type: 'triangle', gain: 0.03 });
        break;
      case 'victory':
        [392, 523, 659, 784].forEach((freq, index) => {
          this.tone(freq, 0.6, { type: 'triangle', gain: 0.055, delay: index * 0.13 });
        });
        break;
      case 'defeat':
        [220, 196, 165, 110].forEach((freq, index) => {
          this.tone(freq, 0.7, { type: 'sawtooth', gain: 0.04, delay: index * 0.16, filter: 'lowpass', filterFreq: 700 });
        });
        break;
      case 'step':
        this.tone(80, 0.06, { type: 'sine', gain: 0.015, endFreq: 55 });
        break;
      case 'boss':
        this.tone(60, 0.9, { type: 'sawtooth', gain: 0.07, endFreq: 32, filter: 'lowpass', filterFreq: 300 });
        this.noise(0.7, { filter: 'lowpass', freq: 400, endFreq: 80, gain: 0.07 });
        break;
      case 'stun':
        this.tone(880, 0.15, { type: 'square', gain: 0.03, endFreq: 440 });
        break;
      default:
        break;
    }
  }

  silence() {
    if (!this.ctx) return;
    try {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
    } catch {
      // Ignore.
    }
  }

  restore() {
    if (!this.ctx || this.muted) return;
    try {
      this.master.gain.setTargetAtTime(0.32, this.ctx.currentTime, 0.05);
    } catch {
      // Ignore.
    }
  }
}
