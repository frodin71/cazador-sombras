// Audio ligero con Web Audio API (beeps sintetizados, sin archivos externos).
export class Audio {
  constructor() {
    this.ctx = null
    this.muted = false
  }

  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        this.ctx = null
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume()
  }

  beep(freq, dur, type = 'sine', gain = 0.07) {
    if (this.muted) return
    this.ensure()
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(this.ctx.destination)
    osc.start(t)
    osc.stop(t + dur)
  }

  torch() { this.beep(520, 0.12, 'triangle') }
  candle() { this.beep(740, 0.13, 'sine'); this.beep(1050, 0.11, 'sine') }
  power() { this.beep(600, 0.18, 'square', 0.05) }
  hit() { this.beep(110, 0.4, 'sawtooth', 0.11) }

  toggleMute() { this.muted = !this.muted; return this.muted }
}
