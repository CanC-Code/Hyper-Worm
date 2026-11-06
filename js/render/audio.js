export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgOsc = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3; // Overall volume
    this.masterGain.connect(this.ctx.destination);

    // Start background hum
    this.startAmbient();
  }

  startAmbient() {
    this.bgOsc = this.ctx.createOscillator();
    const bgGain = this.ctx.createGain();
    this.bgOsc.type = "sine";
    this.bgOsc.frequency.value = 55; // Low A note
    
    this.bgOsc.connect(bgGain);
    bgGain.connect(this.masterGain);
    bgGain.gain.value = 0.05;
    
    this.bgOsc.start();
  }

  playTone(freq, type, duration, vol) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  eat() { this.playTone(800, "square", 0.1, 0.1); }
  powerup() { this.playTone(1200, "sine", 0.4, 0.2); }
  die() { this.playTone(100, "sawtooth", 0.8, 0.3); }
  bite() { this.playTone(300, "triangle", 0.2, 0.1); }
}
