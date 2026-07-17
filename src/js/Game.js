import { MODES } from './modes.js'
import {
  Player, Shadow, Fleer, Blinker, Obstacle, Torch, Candle, Powerup, Particle,
  POWERUP_TYPES, clamp, rand,
} from './entities.js'

const TORCH_COST = 25

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  const nx = clamp(cx, rx, rx + rw)
  const ny = clamp(cy, ry, ry + rh)
  return Math.hypot(cx - nx, cy - ny) < cr
}

export class Game {
  constructor(ctx, audio) {
    this.ctx = ctx
    this.audio = audio
    this.W = 800
    this.H = 600
    this.state = 'menu' // 'menu' | 'playing' | 'gameover'
    this.mode = MODES.normal
    this.onGameOver = null

    this.player = new Player(this.W / 2, this.H - 90)
    this.resetEntities()

    // Canvas offscreen para la capa de oscuridad (con agujeros de luz).
    this.darkCanvas = document.createElement('canvas')
    this.darkCtx = this.darkCanvas.getContext('2d')

    this.last = 0
    this.loop = this.loop.bind(this)
    requestAnimationFrame(this.loop)
  }

  setViewport(w, h) {
    this.W = w
    this.H = h
    this.darkCanvas.width = Math.max(1, Math.floor(w))
    this.darkCanvas.height = Math.max(1, Math.floor(h))
    this.player.y = h - 90
    this.player.setBounds(0, w)
  }

  resetEntities() {
    this.shadows = []
    this.obstacles = []
    this.torches = []
    this.candles = []
    this.powerups = []
    this.particles = []
    this.elapsed = 0
    this.score = 0
    this.worldSpeed = 120
    this.timeScale = 1
    this.slowmo = 0
    this.shake = 0
    this.flash = 0
    this.tShadow = 0
    this.tObstacle = 0
    this.tCandle = 1.5
    this.tPowerup = 6
  }

  startMode(modeId) {
    this.mode = MODES[modeId] || MODES.normal
    this.resetEntities()
    this.player.baseLight = this.mode.id === 'oscuridad' ? 100 : 140
    this.player.reset(this.W / 2)
    this.state = 'playing'
  }

  // ---- input ----
  setAxis(a) { this.player.axis = a; if (a !== 0) this.player.targetX = null }
  setTarget(x) { this.player.targetX = x === null ? null : clamp(x, this.player.minX, this.player.maxX) }

  placeTorch() {
    if (this.state !== 'playing') return
    if (this.player.energy >= TORCH_COST) {
      this.torches.push(new Torch(this.player.x, this.player.y))
      this.player.energy -= TORCH_COST
      this.audio.torch()
      this.addParticles(this.player.x, this.player.y, 10, '#ffb24d')
    }
  }

  // Busca una posición X (centro) cerca del tope que no pise obstáculos ni velas ya presentes.
  freeTopX(half) {
    const band = 100
    for (let i = 0; i < 14; i++) {
      const x = rand(half + 8, this.W - half - 8)
      let ok = true
      for (const o of this.obstacles) {
        if (o.y < band && x + half > o.x - 14 && x - half < o.x + o.w + 14) { ok = false; break }
      }
      if (ok) {
        for (const c of this.candles) {
          if (c.y < band && Math.abs(c.x - x) < half + 26) { ok = false; break }
        }
      }
      if (ok) return x
    }
    return rand(half + 8, this.W - half - 8)
  }

  addParticles(x, y, n, color, spread = 140) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = rand(20, spread)
      this.particles.push(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.3, 0.7), color, rand(1.5, 3.5)))
    }
  }

  // ---- loop ----
  loop(now) {
    const dt = this.last ? clamp((now - this.last) / 1000, 0, 0.05) : 0
    this.last = now
    if (this.state === 'playing') this.update(dt)
    this.render(dt)
    requestAnimationFrame(this.loop)
  }

  lightSources(includePlayer = true) {
    const list = []
    if (includePlayer) list.push({ x: this.player.x, y: this.player.y, r: this.player.lightRadius() })
    for (const t of this.torches) list.push({ x: t.x, y: t.y, r: t.r * clamp(t.life / t.maxLife, 0.3, 1) })
    for (const c of this.candles) list.push({ x: c.x, y: c.y, r: c.r })
    return list
  }

  update(dt) {
    this.elapsed += dt
    if (this.slowmo > 0) { this.slowmo -= dt; this.timeScale = 0.45 } else this.timeScale = 1
    if (this.shake > 0) this.shake -= dt
    if (this.flash > 0) this.flash -= dt

    const ts = this.timeScale
    this.worldSpeed = 120 + Math.min(this.elapsed * 4, 220)
    const ws = this.worldSpeed * ts

    this.player.update(dt)

    // Spawns (intervalos que se acortan con el tiempo)
    const diff = Math.min(this.elapsed / 60, 1)
    this.tShadow -= dt * ts
    if (this.tShadow <= 0) {
      this.tShadow = rand(1.4, 2.0) - diff * 0.9
      const sx = rand(20, this.W - 20)
      // Mezcla: ~54% rápidos (se queman), ~24% acechadores (huyen de la luz), ~22% teletransportadores (la luz los paraliza)
      const rr = Math.random()
      const enemy = rr < 0.24 ? new Fleer(sx, -20) : rr < 0.46 ? new Blinker(sx, -20) : new Shadow(sx, -20)
      this.shadows.push(enemy)
    }
    this.tObstacle -= dt * ts
    if (this.tObstacle <= 0) {
      this.tObstacle = rand(1.2, 1.8) - diff * 0.6
      const w = rand(60, 120)
      const cx = this.freeTopX(w / 2)
      this.obstacles.push(new Obstacle(cx - w / 2, -30, w, rand(20, 34)))
    }
    this.tCandle -= dt * ts
    if (this.tCandle <= 0) {
      this.tCandle = rand(3.0, 4.5)
      this.candles.push(new Candle(this.freeTopX(18), -20))
    }
    if (this.mode.powerups) {
      this.tPowerup -= dt * ts
      if (this.tPowerup <= 0) {
        this.tPowerup = rand(8, 12)
        const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)]
        this.powerups.push(new Powerup(rand(30, this.W - 30), -20, type))
      }
    }

    // Los acechadores lentos huyen de antorchas y velas (las rápidas ignoran esto).
    const avoids = [
      ...this.torches.map((t) => ({ x: t.x, y: t.y, r: t.r })),
      ...this.candles.map((c) => ({ x: c.x, y: c.y, r: c.r })),
    ]
    for (const s of this.shadows) s.update(dt, ws, this.player, avoids, this.W, this.H)
    for (const o of this.obstacles) o.update(dt, ws)
    for (const t of this.torches) t.update(dt)
    for (const c of this.candles) c.update(dt, ws)
    for (const p of this.powerups) p.update(dt, ws)
    for (const pt of this.particles) pt.update(dt)

    // Las antorchas no pueden ocupar el mismo espacio que un obstáculo: se apagan al chocar
    for (const t of this.torches) {
      for (const o of this.obstacles) {
        if (circleRect(t.x, t.y, 10, o.x, o.y, o.w, o.h)) {
          t.life = 0
          this.addParticles(t.x, t.y, 6, '#ffb24d')
          break
        }
      }
    }

    // Las antorchas queman solo a las sombras rápidas (quemables) en su camino
    for (const t of this.torches) {
      for (const s of this.shadows) {
        if (s.burnable && !s.dead && Math.hypot(s.x - t.x, s.y - t.y) < t.r * 0.5) {
          s.dead = true
          this.score += 5
          this.addParticles(s.x, s.y, 9, '#ff9a4d')
        }
      }
    }

    // Limpiar fuera de pantalla / muertos
    this.shadows = this.shadows.filter((s) => !s.dead && s.y - s.r < this.H + 40)
    this.obstacles = this.obstacles.filter((o) => o.y < this.H + 40)
    this.torches = this.torches.filter((t) => t.alive && t.y > -80)
    this.candles = this.candles.filter((c) => !c.collected && c.y - c.r < this.H + 40)
    this.powerups = this.powerups.filter((p) => p.y - p.r < this.H + 40)
    this.particles = this.particles.filter((p) => !p.dead)

    this.handlePickups()
    this.handleCollisions()
    this.handleDarkness(dt)

    // Puntuación
    this.score += dt * 12
  }

  handlePickups() {
    // Velas → energía (y vida en modo oscuridad)
    for (const c of this.candles) {
      if (Math.hypot(this.player.x - c.x, this.player.y - c.y) < this.player.r + c.r * 0.35) {
        c.collected = true
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + c.give)
        if (this.mode.darknessDamage) this.player.health = Math.min(this.player.maxHealth, this.player.health + 20)
        this.score += 20
        this.audio.candle()
        this.addParticles(c.x, c.y, 12, '#ffd257')
      }
    }
    // Power-ups
    for (const p of this.powerups) {
      if (Math.hypot(this.player.x - p.x, this.player.y - p.y) < this.player.r + p.r) {
        p.collected = true
        this.applyPowerup(p.type)
      }
    }
    this.powerups = this.powerups.filter((p) => !p.collected)
  }

  applyPowerup(type) {
    this.audio.power()
    if (type === 'shield') this.player.shield = 6
    else if (type === 'slowmo') this.slowmo = 5
    else if (type === 'lightburst') {
      this.addParticles(this.player.x, this.player.y, 40, '#fff2c0', 320)
      this.shadows = []
      this.shake = 0.35
      this.flash = 0.4
    }
  }

  handleCollisions() {
    const p = this.player
    // Obstáculos
    for (const o of this.obstacles) {
      if (circleRect(p.x, p.y, p.r, o.x, o.y, o.w, o.h)) {
        if (p.shield > 0) { o.y = this.H + 100; this.addParticles(p.x, p.y, 8, '#88c8ff') }
        else return this.gameOver()
      }
    }
    // Sombras
    for (const s of this.shadows) {
      if (Math.hypot(p.x - s.x, p.y - s.y) < p.r + s.r) {
        if (p.shield > 0) { s.y = this.H + 100; this.addParticles(p.x, p.y, 8, '#88c8ff') }
        else return this.gameOver()
      }
    }
  }

  handleDarkness(dt) {
    if (!this.mode.darknessDamage) return
    const safe = this.lightSources(false).some(
      (l) => Math.hypot(this.player.x - l.x, this.player.y - l.y) < l.r * 0.85,
    )
    // Drenaje base constante (la oscuridad te consume); estar en luz de vela/antorcha regenera.
    const rate = safe ? 16 : -7
    this.player.health = clamp(this.player.health + rate * dt, 0, this.player.maxHealth)
    if (this.player.health <= 0) this.gameOver()
  }

  gameOver() {
    if (this.state !== 'playing') return
    this.state = 'gameover'
    this.shake = 0.5
    this.audio.hit()
    if (this.onGameOver) this.onGameOver(Math.floor(this.score))
  }

  // ---- render ----
  render(dt) {
    const ctx = this.ctx
    ctx.save()
    if (this.shake > 0) {
      const m = this.shake * 18
      ctx.translate(rand(-m, m), rand(-m, m))
    }

    this.renderBackground(ctx)

    for (const o of this.obstacles) o.render(ctx)
    for (const c of this.candles) c.render(ctx)
    for (const t of this.torches) t.render(ctx)
    for (const p of this.powerups) p.render(ctx)
    for (const s of this.shadows) s.render(ctx)
    this.player.render(ctx)

    // Glow aditivo en las fuentes de luz (halo cálido)
    ctx.globalCompositeOperation = 'lighter'
    for (const l of this.lightSources(true)) {
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r)
      g.addColorStop(0, 'rgba(255,205,120,0.55)')
      g.addColorStop(0.5, 'rgba(255,175,75,0.20)')
      g.addColorStop(1, 'rgba(255,175,75,0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'

    // Oscuridad: capa SEPARADA (offscreen) con agujeros de luz, dibujada encima.
    // Así la luz revela la escena en vez de mostrar negro.
    const dctx = this.darkCtx
    dctx.setTransform(1, 0, 0, 1, 0, 0)
    dctx.clearRect(0, 0, this.W, this.H)
    dctx.fillStyle = `rgba(3,3,10,${this.mode.darknessAlpha})`
    dctx.fillRect(0, 0, this.W, this.H)
    dctx.globalCompositeOperation = 'destination-out'
    for (const l of this.lightSources(true)) {
      const g = dctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r)
      g.addColorStop(0, 'rgba(0,0,0,1)')
      g.addColorStop(0.65, 'rgba(0,0,0,0.9)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      dctx.fillStyle = g
      dctx.beginPath(); dctx.arc(l.x, l.y, l.r, 0, Math.PI * 2); dctx.fill()
    }
    dctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(this.darkCanvas, 0, 0, this.W, this.H)

    for (const pt of this.particles) pt.render(ctx)

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flash})`
      ctx.fillRect(0, 0, this.W, this.H)
    }

    ctx.restore()
    this.renderHUD(ctx)
  }

  renderBackground(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, this.H)
    g.addColorStop(0, '#0a0a1a')
    g.addColorStop(1, '#131a33')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, this.W, this.H)
    // Líneas del pasillo (efecto de profundidad) que bajan
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    const off = (this.elapsed * 60) % 60
    for (let i = -1; i < this.H / 60 + 1; i++) {
      const y = i * 60 + off
      const w = 80 + i * 26
      ctx.beginPath()
      ctx.moveTo(this.W / 2 - w / 2, y)
      ctx.lineTo(this.W / 2 + w / 2, y)
      ctx.stroke()
    }
  }

  renderHUD(ctx) {
    if (this.state === 'menu') return
    ctx.save()
    ctx.font = 'bold 15px system-ui, sans-serif'
    // Energía
    this.bar(ctx, 16, 16, 160, 12, this.player.energy / this.player.maxEnergy, '#e8963d')
    ctx.fillStyle = '#fff'
    ctx.fillText('Energía', 16, 42)
    // Vida (solo oscuridad)
    let topY = 54
    if (this.mode.darknessDamage) {
      this.bar(ctx, 16, 58, 160, 12, this.player.health / this.player.maxHealth, '#ff5a5a')
      ctx.fillStyle = '#fff'
      ctx.fillText('Vida', 16, 84)
      topY = 96
    }
    // Score + modo
    ctx.fillStyle = '#ffcf6b'
    ctx.font = 'bold 20px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(String(Math.floor(this.score)), this.W - 16, 32)
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillStyle = '#9aa0b4'
    ctx.fillText(this.mode.label, this.W - 16, 50)
    ctx.textAlign = 'left'
    // Efectos activos
    let ey = topY
    ctx.font = '13px system-ui, sans-serif'
    if (this.player.shield > 0) { ctx.fillStyle = '#88c8ff'; ctx.fillText(`🛡️ ${this.player.shield.toFixed(1)}s`, 16, ey + 14); ey += 20 }
    if (this.slowmo > 0) { ctx.fillStyle = '#88c8ff'; ctx.fillText(`🐌 ${this.slowmo.toFixed(1)}s`, 16, ey + 14) }
    ctx.restore()
  }

  bar(ctx, x, y, w, h, pct, color) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = color
    ctx.fillRect(x, y, w * clamp(pct, 0, 1), h)
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, w, h)
  }
}
