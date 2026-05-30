// Sonification via the Web Audio API. Each step plays a short tone whose pitch maps to
// the value being touched, so the array "plays" itself as it sorts. No assets, no deps.

export class SoundPlayer {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = false;
  }

  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.16; // overall volume, kept gentle
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return true;
  }

  // Call from within a user gesture (click / keydown) so autoplay policy lets it run.
  resume() {
    if (this.enabled) this._ensure();
  }

  setEnabled(on) {
    this.enabled = !!on;
    if (this.enabled) this._ensure();
  }

  // value: the array value at the touched index; maxVal: current run max (for normalization)
  note(value, maxVal) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const norm = Math.max(0, Math.min(1, value / (maxVal || 1)));
    const freq = 180 + norm * 720; // ~180-900 Hz
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // A short satisfying rise when a run completes.
  complete() {
    if (!this.enabled || !this.ctx) return;
    const base = this.ctx.currentTime;
    const semis = [0, 4, 7, 12]; // major arpeggio
    semis.forEach((s, i) => {
      const dt = i * 0.07;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440 * Math.pow(2, s / 12);
      g.gain.setValueAtTime(0.0001, base + dt);
      g.gain.exponentialRampToValueAtTime(0.7, base + dt + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, base + dt + 0.28);
      osc.connect(g);
      g.connect(this.master);
      osc.start(base + dt);
      osc.stop(base + dt + 0.32);
    });
  }
}
