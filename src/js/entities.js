// Entidades del juego. Todas trabajan en coordenadas lógicas (CSS px).
// El "mundo" baja: las entidades se mueven hacia abajo con worldSpeed.

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const rand = (a, b) => a + Math.random() * (b - a)

export class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.r = 18
    this.axis = 0            // -1..1 desde teclado/botones
    this.targetX = null      // desde arrastre táctil (si no es null, manda)
    this.speed = 560         // px/s
    this.energy = 100
    this.maxEnergy = 100
    this.health = 100
    this.maxHealth = 100
    this.shield = 0          // segundos de escudo restante
    this.baseLight = 130     // radio de luz del jugador
    this.minX = 0
    this.maxX = 1000
    this.pulse = 0
  }

  setBounds(min, max) {
    this.minX = min + this.r
    this.maxX = max - this.r
    this.x = clamp(this.x, this.minX, this.maxX)
    if (this.targetX !== null) this.targetX = clamp(this.targetX, this.minX, this.maxX)
  }

  lightRadius() {
    return this.baseLight + Math.sin(this.pulse) * 8
  }

  update(dt) {
    this.pulse += dt * 3
    if (this.targetX !== null) {
      const dx = this.targetX - this.x
      const step = this.speed * dt
      this.x += Math.abs(dx) <= step ? dx : Math.sign(dx) * step
    } else {
      this.x += this.axis * this.speed * dt
    }
    this.x = clamp(this.x, this.minX, this.maxX)
    if (this.shield > 0) this.shield = Math.max(0, this.shield - dt)
  }

  render(ctx) {
    // Cuerpo (orbe luminoso)
    const g = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.r)
    g.addColorStop(0, '#fff7e0')
    g.addColorStop(1, '#ffb24d')
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()

    if (this.shield > 0) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r + 8, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(120,200,255,${0.4 + 0.3 * Math.sin(this.pulse * 4)})`
      ctx.lineWidth = 3
      ctx.stroke()
    }
  }

  reset(x) {
    this.x = x
    this.targetX = null
    this.axis = 0
    this.energy = this.maxEnergy
    this.health = this.maxHealth
    this.shield = 0
  }
}

// Sombra RÁPIDA: persigue fuerte al jugador y muere si una antorcha la toca.
export class Shadow {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.r = rand(13, 19)
    this.speed = rand(55, 95)
    this.wob = Math.random() * Math.PI * 2
    this.burnable = true
    this.dead = false
  }

  update(dt, worldSpeed, player) {
    this.wob += dt * 6
    this.y += (worldSpeed + this.speed) * dt
    const dx = player.x - this.x
    this.x += Math.sign(dx) * Math.min(95 * dt, Math.abs(dx))
    this.x += Math.sin(this.wob) * 22 * dt
  }

  render(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.beginPath()
    ctx.arc(0, 0, this.r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(30,6,18,0.94)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(220,70,90,0.6)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#ff3b57'
    const ey = -this.r * 0.15
    ctx.beginPath(); ctx.arc(-this.r * 0.32, ey, 2.6, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(this.r * 0.32, ey, 2.6, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}

// Acechador LENTO: huye de la luz (antorchas y velas). No muere con la luz; hay que esquivarlo.
export class Fleer {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.r = rand(16, 24)
    this.speed = rand(15, 38)
    this.wob = Math.random() * Math.PI * 2
    this.burnable = false
    this.dead = false
    this.vx = 0
  }

  update(dt, worldSpeed, player, avoids) {
    this.wob += dt * 3
    this.y += (worldSpeed + this.speed) * dt

    // Huir de la luz como una fuerza con inercia (no un salto de posición):
    // acelera lateralmente lejos del centro y arrastra esa velocidad con amortiguación,
    // así se DESLIZA rodeando la vela en una curva suave.
    let ax = 0
    for (const a of avoids) {
      const ex = this.x - a.x
      const ey = this.y - a.y
      const d = Math.hypot(ex, ey)
      if (d > 0.01 && d < a.r) {
        const s = 1 - d / a.r
        ax += (ex / d) * s * 2900
        if (ey > 0) this.y -= s * 30 * dt // leve retroceso hacia arriba, nunca hacia el jugador
      }
    }
    this.vx = (this.vx + ax * dt) * Math.exp(-dt * 4.5)
    this.vx = clamp(this.vx, -340, 340)
    this.x += this.vx * dt

    // Persecución lenta + bamboleo
    const dx = player.x - this.x
    this.x += Math.sign(dx) * Math.min(26 * dt, Math.abs(dx))
    this.x += Math.sin(this.wob) * 10 * dt
  }

  render(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.beginPath()
    ctx.arc(0, 0, this.r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(8,12,30,0.92)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(90,150,220,0.55)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#63c8ff'
    const ey = -this.r * 0.1
    ctx.beginPath(); ctx.arc(-this.r * 0.3, ey, 2.4, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(this.r * 0.3, ey, 2.4, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}

export class Obstacle {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h
  }
  update(dt, worldSpeed) { this.y += worldSpeed * dt }
  render(ctx) {
    ctx.fillStyle = '#2a2036'
    ctx.strokeStyle = '#5a4a70'
    ctx.lineWidth = 2
    ctx.fillRect(this.x, this.y, this.w, this.h)
    ctx.strokeRect(this.x, this.y, this.w, this.h)
  }
}

export class Torch {
  constructor(x, y) {
    this.x = x; this.y = y
    this.life = 6           // segundos
    this.maxLife = 6
    this.r = 130            // radio de luz / repulsión
    this.vy = -240          // se lanza hacia adelante (arriba), hacia las sombras
  }
  get alive() { return this.life > 0 }
  update(dt) { this.y += this.vy * dt; this.life -= dt }
  render(ctx) {
    const t = Math.max(0, this.life / this.maxLife)
    ctx.beginPath()
    ctx.arc(this.x, this.y, 6 + Math.sin(Date.now() / 90) * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,${150 + t * 60},60,${0.7 + t * 0.3})`
    ctx.fill()
  }
}

export class Candle {
  constructor(x, y) {
    this.x = x; this.y = y
    this.r = 110            // radio de luz / repulsión mientras está en el campo
    this.collected = false
    this.give = 35         // energía que entrega
  }
  update(dt, worldSpeed) { this.y += worldSpeed * dt }
  render(ctx) {
    // Vela: base + llama
    ctx.fillStyle = '#e8e0c8'
    ctx.fillRect(this.x - 4, this.y - 2, 8, 14)
    const flick = Math.sin(Date.now() / 80 + this.x) * 1.2
    ctx.beginPath()
    ctx.moveTo(this.x, this.y - 14 + flick)
    ctx.quadraticCurveTo(this.x + 5, this.y - 4, this.x, this.y - 2)
    ctx.quadraticCurveTo(this.x - 5, this.y - 4, this.x, this.y - 14 + flick)
    ctx.fillStyle = '#ffd257'
    ctx.fill()
  }
}

export const POWERUP_TYPES = ['shield', 'lightburst', 'slowmo']

export class Powerup {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.r = 16; this.type = type
    this.emoji = type === 'shield' ? '🛡️' : type === 'lightburst' ? '✨' : '🐌'
  }
  update(dt, worldSpeed) { this.y += worldSpeed * dt }
  render(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(120,200,255,0.18)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(120,200,255,0.8)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.font = '18px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.emoji, this.x, this.y + 1)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
  }
}

export class Particle {
  constructor(x, y, vx, vy, life, color, size) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy
    this.life = life; this.maxLife = life; this.color = color; this.size = size
  }
  get dead() { return this.life <= 0 }
  update(dt) {
    this.x += this.vx * dt
    this.y += this.vy * dt
    this.vx *= 0.96
    this.vy *= 0.96
    this.life -= dt
  }
  render(ctx) {
    const a = Math.max(0, this.life / this.maxLife)
    ctx.globalAlpha = a
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}
