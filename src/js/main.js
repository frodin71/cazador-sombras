import { Game } from './game/Game.js';

class GameApp {
  constructor() {
    this.game = null;
    this.canvas = null;
    this.isInitialized = false;
    
    this.init();
  }
  
  async init() {
    try {
      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupGame());
      } else {
        this.setupGame();
      }
    } catch (error) {
      console.error('Error inicializando el juego:', error);
      this.showError('Error al inicializar el juego');
    }
  }
  
  setupGame() {
    try {
      // Obtener canvas
      this.canvas = document.getElementById('game-canvas');
      if (!this.canvas) {
        throw new Error('Canvas no encontrado');
      }
      
      // Configurar canvas
      this.setupCanvas();
      
      // Crear instancia del juego
      this.game = new Game(this.canvas);
      
      // Configurar eventos del juego
      this.setupGameEvents();
      
      // Configurar eventos de la ventana
      this.setupWindowEvents();
      
      this.isInitialized = true;
      console.log('Juego inicializado correctamente');
      
      // Mostrar mensaje de bienvenida
      console.log('Llamando a showWelcomeMessage...');
      this.showWelcomeMessage();
      
    } catch (error) {
      console.error('Error configurando el juego:', error);
      this.showError('Error al configurar el juego');
    }
  }
  
  setupCanvas() {
    // Configurar tamaño del canvas
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Configurar contexto
    const ctx = this.canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Configurar para dispositivos de alta densidad
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  setupGameEvents() {
    if (!this.game) return;
    
    // Eventos de cambio de estado
    this.game.gameState.onStateChange('playing', () => {
      console.log('Juego iniciado');
      this.hideWelcomeMessage();
    });
    
    this.game.gameState.onStateChange('gameOver', () => {
      console.log('Game Over');
      this.showGameOverMessage();
    });
    
    // Eventos de click para restart
    this.canvas.addEventListener('click', (e) => {
      if (this.game.gameState.isGameOver()) {
        this.handleRestartClick(e);
      }
    });
  }
  
  setupWindowEvents() {
    // Redimensionar ventana
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    // Visibilidad de la página (para pausar cuando no está visible)
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
    
    // Prevenir context menu en el canvas
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Prevenir selección de texto
    this.canvas.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
  }
  
  handleResize() {
    if (this.canvas && this.game) {
      this.setupCanvas();
      this.game.resizeCanvas();
    }
  }
  
  handleVisibilityChange() {
    if (document.hidden && this.game && this.game.gameState.isPlaying()) {
      // Pausar juego cuando la página no está visible
      this.game.gameState.pause();
    }
  }
  
  handleRestartClick(e) {
    if (!this.game || !this.game.gameState.isGameOver()) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Verificar si el click fue en el botón de restart
    if (this.game.restartButton) {
      const button = this.game.restartButton;
      if (x >= button.x && x <= button.x + button.width &&
          y >= button.y && y <= button.y + button.height) {
        this.game.restart();
        this.hideGameOverMessage();
      }
    }
  }
  
  showWelcomeMessage() {
    console.log('showWelcomeMessage ejecutándose...');
    // Crear mensaje de bienvenida
    const welcomeDiv = document.createElement('div');
    welcomeDiv.id = 'welcome-message';
    welcomeDiv.innerHTML = `
      <div class="welcome-content">
        <h1>🎮 Cazador de Sombras</h1>
        <p>¡Bienvenido al juego!</p>
        <div class="instructions">
          <h3>🎯 Objetivo:</h3>
          <p>Sobrevive el mayor tiempo posible esquivando obstáculos y manteniendo las sombras alejadas.</p>
          
          <h3>🎮 Controles:</h3>
          <p><strong>←→</strong> Mover lateralmente</p>
          <p><strong>ESPACIO</strong> Colocar antorcha (cuesta 15 energía)</p>
          
          <h3>💡 Consejos:</h3>
          <p>• Las antorchas ahuyentan las sombras</p>
          <p>• Gestiona tu energía sabiamente</p>
          <p>• Esquiva obstáculos para sobrevivir</p>
        </div>
        <button id="start-game-btn" class="start-btn">¡COMENZAR!</button>
      </div>
    `;
    
    // Estilos del mensaje
    welcomeDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-family: Arial, sans-serif;
      pointer-events: auto;
    `;
    
    // Estilos del contenido
    const content = welcomeDiv.querySelector('.welcome-content');
    content.style.cssText = `
      text-align: center;
      max-width: 600px;
      padding: 40px;
      background: rgba(26,26,46,0.95);
      border-radius: 20px;
      border: 2px solid #4CAF50;
    `;
    
    // Estilos del botón
    const startBtn = welcomeDiv.querySelector('.start-btn');
    startBtn.style.cssText = `
      background: #4CAF50;
      color: white;
      border: 3px solid #45a049;
      padding: 15px 30px;
      font-size: 18px;
      border-radius: 10px;
      cursor: pointer;
      margin-top: 20px;
      font-weight: bold;
      transition: background 0.3s;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    
    startBtn.addEventListener('mouseenter', () => {
      startBtn.style.background = '#45a049';
    });
    
    startBtn.addEventListener('mouseleave', () => {
      startBtn.style.background = '#4CAF50';
    });
    
    startBtn.addEventListener('click', () => {
      console.log('Botón COMENZAR clickeado!');
      this.startGame();
    });
    
    console.log('Botón COMENZAR configurado con event listener');
    
    document.body.appendChild(welcomeDiv);
    console.log('Mensaje de bienvenida creado y agregado al DOM');
    console.log('Elemento welcomeDiv:', welcomeDiv);
    console.log('Botón startBtn:', startBtn);
  }
  
  hideWelcomeMessage() {
    const welcomeDiv = document.getElementById('welcome-message');
    if (welcomeDiv) {
      console.log('Ocultando mensaje de bienvenida');
      welcomeDiv.remove();
    } else {
      console.log('No se encontró el mensaje de bienvenida para ocultar');
    }
  }
  
  showGameOverMessage() {
    // El mensaje de game over ya está en la clase Game
    // Solo necesitamos asegurarnos de que sea visible
  }
  
  hideGameOverMessage() {
    // El mensaje se oculta automáticamente cuando se reinicia el juego
  }
  
  startGame() {
    if (this.game) {
      // Ocultar mensaje de bienvenida
      this.hideWelcomeMessage();
      
      // Iniciar el juego manualmente
      this.game.start();
      console.log('Juego iniciado desde botón COMENZAR');
    }
  }
  
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #f44336;
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: Arial, sans-serif;
      z-index: 9999;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
  
  // Métodos públicos para control externo
  pause() {
    if (this.game) {
      this.game.gameState.pause();
    }
  }
  
  resume() {
    if (this.game) {
      this.game.gameState.resume();
    }
  }
  
  restart() {
    if (this.game) {
      this.game.restart();
    }
  }
  
  destroy() {
    if (this.game) {
      // Limpiar recursos del juego
      this.game.audioManager.destroy();
      this.game.inputManager.destroy();
    }
    
    // Remover event listeners
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.game = null;
    this.canvas = null;
    this.isInitialized = false;
  }
}

// Inicializar la aplicación cuando se carga el script
const gameApp = new GameApp();

// Exportar para uso externo
window.GameApp = gameApp;

// Manejar errores globales
window.addEventListener('error', (e) => {
  console.error('Error global:', e.error);
  if (gameApp) {
    gameApp.showError('Error inesperado del juego');
  }
});

// Manejar promesas rechazadas
window.addEventListener('unhandledrejection', (e) => {
  console.error('Promesa rechazada:', e.reason);
  if (gameApp) {
    gameApp.showError('Error en el juego');
  }
});
