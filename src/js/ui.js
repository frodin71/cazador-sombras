// Construye los overlays de DOM: menú de modos, game over y controles móviles.
import { MODES, MODE_ORDER } from './modes.js'

const overlayRoot = () => document.getElementById('ui-overlay')

function clearOverlays() {
  overlayRoot().querySelectorAll('.overlay').forEach((el) => el.remove())
}

export function highScore(modeId) {
  return Number(localStorage.getItem(`cazador_hs_${modeId}`) || 0)
}
export function saveHighScore(modeId, score) {
  if (score > highScore(modeId)) localStorage.setItem(`cazador_hs_${modeId}`, String(score))
}

// Menú principal con los 3 modos. onPick(modeId) al elegir.
export function showMenu(onPick) {
  clearOverlays()
  const ov = document.createElement('div')
  ov.className = 'overlay'
  const modesHtml = MODE_ORDER.map((id) => {
    const m = MODES[id]
    return `
      <button class="mode-btn" data-mode="${id}">
        <span class="mode-emoji">${m.emoji}</span>
        <span class="mode-text"><h3>${m.label}</h3><p>${m.desc}</p></span>
      </button>`
  }).join('')

  ov.innerHTML = `
    <div class="panel">
      <div class="title">Cazador de Sombras</div>
      <div class="subtitle">Elige un modo para empezar</div>
      <div class="modes">${modesHtml}</div>
      <div class="hint">PC: ← → o A/D para moverte · ESPACIO para antorcha.<br>Móvil: arrastra para moverte · toca 🔥 para antorcha.</div>
    </div>`

  ov.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-mode')
      ov.remove()
      onPick(id)
    })
  })
  overlayRoot().appendChild(ov)
}

// Pantalla de game over. onRetry() reintenta mismo modo, onMenu() vuelve al menú.
export function showGameOver(modeId, score, best, onRetry, onMenu) {
  clearOverlays()
  const ov = document.createElement('div')
  ov.className = 'overlay gameover'
  ov.innerHTML = `
    <div class="panel">
      <div class="title">GAME OVER</div>
      <div class="subtitle">Modo ${MODES[modeId].label}</div>
      <div style="font-size:22px;margin:6px 0">Puntuación: <b>${score}</b></div>
      <div class="record">🏆 Mejor: ${best}</div>
      <div class="go-actions">
        <button class="btn btn-primary" data-act="retry">Reintentar</button>
        <button class="btn" data-act="menu">Menú</button>
      </div>
    </div>`
  ov.querySelector('[data-act="retry"]').addEventListener('click', () => { ov.remove(); onRetry() })
  ov.querySelector('[data-act="menu"]').addEventListener('click', () => { ov.remove(); onMenu() })
  overlayRoot().appendChild(ov)
}

// Botón de mute persistente.
export function createMuteButton(onToggle) {
  const btn = document.createElement('button')
  btn.className = 'mute-btn'
  btn.textContent = '🔊'
  btn.addEventListener('click', () => {
    const muted = onToggle()
    btn.textContent = muted ? '🔇' : '🔊'
  })
  overlayRoot().appendChild(btn)
}

// Controles táctiles (solo se muestran en dispositivos con touch).
// handlers: { onDir(dir), onFire() }
export function createTouchControls(handlers) {
  const wrap = document.createElement('div')
  wrap.className = 'touch-controls'
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0
  if (isTouch) wrap.classList.add('active')

  const mk = (cls, label) => {
    const b = document.createElement('div')
    b.className = `tc-btn ${cls}`
    b.textContent = label
    return b
  }
  const left = mk('tc-left', '◀')
  const right = mk('tc-right', '▶')
  const fire = mk('tc-fire', '🔥')

  const hold = (el, on, off) => {
    const start = (e) => { e.preventDefault(); on() }
    const end = (e) => { e.preventDefault(); off() }
    el.addEventListener('pointerdown', start)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointerleave', end)
    el.addEventListener('pointercancel', end)
  }
  hold(left, () => handlers.onDir(-1), () => handlers.onDir(0))
  hold(right, () => handlers.onDir(1), () => handlers.onDir(0))
  fire.addEventListener('pointerdown', (e) => { e.preventDefault(); handlers.onFire() })

  wrap.append(left, right, fire)
  overlayRoot().appendChild(wrap)
}
