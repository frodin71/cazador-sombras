# 🎮 Cazador de Sombras

Un juego de supervivencia en un pasillo oscuro donde debes mantener las sombras alejadas con antorchas mientras esquivas obstáculos.

## 🚀 Características

- **Gameplay único**: Pasillo 3D hacia adelante con movimiento lateral
- **Sistema de sombras**: Criaturas que te persiguen y se alejan de la luz
- **Gestión de recursos**: Energía limitada para colocar antorchas
- **Obstáculos dinámicos**: Rocas y árboles que aparecen aleatoriamente
- **Efectos visuales**: Luces parpadeantes, sombras con ojos rojos
- **Sistema de estados**: Menú, jugando, pausado, game over
- **Responsive**: Funciona en desktop y móviles
- **Arquitectura modular**: Código organizado en clases reutilizables

## 🎯 Objetivo del Juego

Sobrevive el mayor tiempo posible esquivando obstáculos y manteniendo las sombras alejadas con antorchas. Cada antorcha consume energía, así que debes balancear entre gastar y guardar recursos.

## 🎮 Controles

- **←→** (Flechas): Mover lateralmente
- **ESPACIO**: Colocar antorcha (cuesta 15 energía)
- **Mouse/Touch**: Click en botón de restart

## 🏗️ Estructura del Proyecto

```
juego/
├── src/
│   ├── js/
│   │   ├── game/           # Lógica del juego
│   │   │   ├── Game.js     # Clase principal
│   │   │   ├── Player.js   # Jugador
│   │   │   ├── TorchManager.js    # Sistema de antorchas
│   │   │   ├── ShadowManager.js   # Sistema de sombras
│   │   │   ├── ObstacleManager.js # Sistema de obstáculos
│   │   │   └── CollisionManager.js # Detección de colisiones
│   │   ├── ui/             # Interfaz de usuario
│   │   ├── utils/          # Utilidades
│   │   │   ├── InputManager.js    # Gestión de input
│   │   │   ├── AudioManager.js    # Gestión de audio
│   │   │   └── GameState.js       # Estados del juego
│   │   └── main.js         # Punto de entrada
│   ├── assets/             # Recursos del juego
│   │   ├── images/         # Imágenes y sprites
│   │   ├── audio/          # Música y efectos
│   │   └── data/           # Datos del juego
│   └── styles/             # Estilos CSS
├── dist/                   # Build de producción
├── docs/                   # Documentación
├── tests/                  # Tests unitarios
└── package.json            # Dependencias
```

## 🛠️ Tecnologías Utilizadas

- **JavaScript ES6+**: Lógica del juego
- **HTML5 Canvas**: Renderizado 2D
- **CSS3**: Estilos y responsive design
- **Webpack**: Bundling y desarrollo
- **Howler.js**: Gestión de audio
- **Jest**: Testing unitario
- **ESLint**: Linting de código

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 16+ 
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd juego
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:9000
   ```

### Scripts Disponibles

- `npm run dev`: Servidor de desarrollo con hot reload
- `npm run build`: Build de producción
- `npm run test`: Ejecutar tests
- `npm run lint`: Verificar código con ESLint

## 🎨 Personalización

### Configuración del Juego

Los parámetros del juego se pueden ajustar en `src/js/game/Game.js`:

```javascript
this.config = {
  TORCH_COST: 15,           // Energía por antorcha
  SHADOW_SPEED: 1.5,        // Velocidad de sombras
  OBSTACLE_SPAWN_RATE: 0.02, // Frecuencia de obstáculos
  INITIAL_GAME_SPEED: 2     // Velocidad inicial
};
```

### Agregar Nuevos Elementos

1. **Nuevos obstáculos**: Editar `ObstacleManager.js`
2. **Nuevos tipos de sombras**: Editar `ShadowManager.js`
3. **Nuevos efectos**: Agregar en las clases correspondientes

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm test -- --watch

# Tests con coverage
npm test -- --coverage
```

## 📱 Build para Producción

```bash
# Build optimizado
npm run build

# Los archivos se generan en la carpeta `dist/`
```

## 🌐 Despliegue

Los archivos en `dist/` están listos para ser subidos a cualquier servidor web estático:

- Netlify
- Vercel
- GitHub Pages
- Servidor propio

## 📱 Preparación para Mobile/APK

### Responsive Design
El juego ya incluye:
- Touch controls
- Responsive canvas
- Prevención de scroll en móviles

### Próximos Pasos para APK
1. **Capacitor/Cordova**: Empaquetar como app nativa
2. **PWA**: Convertir en Progressive Web App
3. **Optimizaciones móviles**: FPS, batería, etc.

## 🔧 Arquitectura del Código

### Patrones Utilizados

- **MVC**: Separación de lógica, vista y control
- **Observer**: Sistema de eventos y callbacks
- **Factory**: Creación de entidades del juego
- **State Machine**: Gestión de estados del juego

### Flujo del Juego

1. **Inicialización**: Setup de canvas, audio, input
2. **Game Loop**: Update → Render → RequestAnimationFrame
3. **Sistemas**: Player, Torches, Shadows, Obstacles
4. **Colisiones**: Detección y respuesta
5. **Estados**: Menu, Playing, Paused, GameOver

## 🎵 Audio

### Sonidos Incluidos
- `torch_place.mp3`: Colocar antorcha
- `game_over.mp3`: Game over
- `shadow_hit.mp3`: Colisión con sombra
- `energy_pickup.mp3`: Recoger energía
- `button_click.mp3`: Click en botones

### Música
- `menu_theme.mp3`: Tema del menú
- `gameplay_theme.mp3`: Música de juego
- `game_over_theme.mp3`: Tema de game over

## 🐛 Troubleshooting

### Problemas Comunes

1. **Audio no funciona**
   - Verificar permisos del navegador
   - Asegurar que los archivos de audio existen

2. **Performance baja**
   - Reducir número de entidades
   - Optimizar renderizado

3. **Canvas no se muestra**
   - Verificar que el DOM esté cargado
   - Revisar errores en consola

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- Inspirado en juegos de supervivencia clásicos
- Comunidad de desarrolladores de juegos HTML5
- Herramientas open source utilizadas

## 📞 Contacto

- **Desarrollador**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]
- **Proyecto**: [URL del repositorio]

---

**¡Disfruta jugando Cazador de Sombras!** 🎮👻🔥
