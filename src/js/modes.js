// Configuración de los tres modos de juego.
// darknessAlpha: qué tan oscura queda la pantalla fuera de la luz.
// darknessDamage: si estar en la oscuridad drena vida.
// powerups: si aparecen power-ups.

export const MODES = {
  normal: {
    id: 'normal',
    label: 'Normal',
    emoji: '🔦',
    desc: 'Recoge velas para tener energía y coloca antorchas. Las sombras huyen de la luz.',
    darknessAlpha: 0.35,
    darknessDamage: false,
    powerups: false,
  },
  oscuridad: {
    id: 'oscuridad',
    label: 'Oscuridad',
    emoji: '🌑',
    desc: 'La oscuridad te drena la vida. Sobrevive saltando de luz en luz.',
    darknessAlpha: 0.82,
    darknessDamage: true,
    powerups: false,
  },
  poderes: {
    id: 'poderes',
    label: 'Power-ups',
    emoji: '⚡',
    desc: 'Aparecen poderes: escudo, ráfaga de luz y cámara lenta.',
    darknessAlpha: 0.4,
    darknessDamage: false,
    powerups: true,
  },
}

export const MODE_ORDER = ['normal', 'oscuridad', 'poderes']
