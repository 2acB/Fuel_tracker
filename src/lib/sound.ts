// ── F1 Sound Synthesizer via Web Audio API ──────────────────

class SoundFx {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 🏁 F1 Pit Stop Complete Sound: Pneumatic Pit Gun + Race Beep
  playPitStopSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Pneumatic Pit Gun Burst (White Noise + Frequency Drop)
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start(now);

    // 2. High-Tech Green Light Pit Exit Beep (3 Rapid Beeps)
    const tones = [880, 1174, 1760]; // A5, D6, A6 (F1 Lights Out Beeps)
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.12 + idx * 0.08);

      toneGain.gain.setValueAtTime(0.25, now + 0.12 + idx * 0.08);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18 + idx * 0.08);

      osc.connect(toneGain);
      toneGain.connect(ctx.destination);

      osc.start(now + 0.12 + idx * 0.08);
      osc.stop(now + 0.20 + idx * 0.08);
    });
  }

  // 🏎️ Vehicle Rev Sound (Engine Ignition rumble)
  playEngineSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.5);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // 🔘 High-Speed Dashboard Click Beep
  playClickSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const soundFx = new SoundFx();
