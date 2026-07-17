import '../styles/main.css'
import { Game } from './Game.js'
import { Audio } from './audio.js'
import { showMenu, showGameOver, createMuteButton, createTouchControls, highScore, saveHighScore } from './ui.js'

const canvas = document.getElementById('game-canvas')
const ctx = canvas.getContext('2d')
const audio = new Audio()
const game = new Game(ctx, audio)

let currentMode = 'normal'

// ---- Movimiento unificado: teclado / botones / inclinación ----
const input = { key: 0, btn: 0, tilt: 0 }
function pushAxis() { game.setAxis(input.key || input.btn || input.tilt) }

// Control por inclinación (giroscopio) en móvil. En iOS requiere permiso tras un gesto.
let tiltEnabled = false
function enableTiltOnce() {
  if (tiltEnabled) return
  const D = window.DeviceOrientationEvent
  const attach = () => {
    tiltEnabled = true
    window.addEventListener('deviceorientation', (e) => {
      const g = e.gamma // inclinación izquierda/derecha (-90..90)
      if (g == null) return
      const dead = 4
      let a = 0
      if (g > dead) a = Math.min(1, (g - dead) / 22)
      else if (g < -dead) a = Math.max(-1, (g + dead) / 22)
      input.tilt = a
      pushAxis()
    })
  }
  if (D && typeof D.requestPermission === 'function') {
    D.requestPermission().then((s) => { if (s === 'granted') attach() }).catch(() => {})
  } else if (D) {
    attach()
  }
}

// ---- Tamaño del canvas (responsive + alta densidad) ----
function resize() {
  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  game.setViewport(w, h)
}
window.addEventListener('resize', resize)
resize()

// ---- Flujo de pantallas ----
function pickMode(id) {
  currentMode = id
  audio.ensure()
  enableTiltOnce()
  game.startMode(id)
}
game.onGameOver = (score) => {
  saveHighScore(currentMode, score)
  showGameOver(currentMode, score, highScore(currentMode),
    () => game.startMode(currentMode),
    () => showMenu(pickMode))
}
showMenu(pickMode)
createMuteButton(() => audio.toggleMute())
createTouchControls({
  onDir: (dir) => { input.btn = dir; pushAxis() },
  onFire: () => game.placeTorch(),
})

// ---- Teclado ----
const keys = { left: false, right: false }
function applyAxis() { input.key = (keys.right ? 1 : 0) - (keys.left ? 1 : 0); pushAxis() }
window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') { keys.left = true; applyAxis(); e.preventDefault() }
  else if (e.code === 'ArrowRight' || e.code === 'KeyD') { keys.right = true; applyAxis(); e.preventDefault() }
  else if (e.code === 'Space') { game.placeTorch(); e.preventDefault() }
})
window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') { keys.left = false; applyAxis() }
  else if (e.code === 'ArrowRight' || e.code === 'KeyD') { keys.right = false; applyAxis() }
})

// ---- Puntero: arrastrar para mover, tocar para antorcha ----
let pointerDown = false
let dragged = false
let startX = 0
function localX(e) {
  const rect = canvas.getBoundingClientRect()
  return e.clientX - rect.left
}
canvas.addEventListener('pointerdown', (e) => {
  pointerDown = true
  dragged = false
  startX = localX(e)
  game.setTarget(startX)
  e.preventDefault()
})
canvas.addEventListener('pointermove', (e) => {
  if (!pointerDown) return
  const x = localX(e)
  if (Math.abs(x - startX) > 6) dragged = true
  game.setTarget(x)
})
function endPointer(e) {
  if (!pointerDown) return
  pointerDown = false
  if (!dragged) game.placeTorch()
  game.setTarget(null)
}
canvas.addEventListener('pointerup', endPointer)
canvas.addEventListener('pointercancel', endPointer)
canvas.addEventListener('contextmenu', (e) => e.preventDefault())

// Pausa el audio si se oculta la pestaña (visibilidad)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && audio.ctx) audio.ctx.suspend()
})
