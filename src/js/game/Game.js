import { Player } from './Player.js';
import { TorchManager } from './TorchManager.js';
import { ShadowManager } from './ShadowManager.js';
import { ObstacleManager } from './ObstacleManager.js';
import { CollisionManager } from './CollisionManager.js';
import { InputManager } from '../utils/InputManager.js';
import { AudioManager } from '../utils/AudioManager.js';
import { GameState } from '../utils/GameState.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameState = new GameState();
    
    console.log('GameState creado:', this.gameState);
    console.log('Estados del GameState:', this.gameState.states);
    
    // Configuración del juego
    this.config = {
      TORCH_COST: 15,
      SHADOW_SPEED: 1.5,
      OBSTACLE_SPAWN_RATE: 0.02,
      INITIAL_GAME_SPEED: 2
    };
    
    // Inicializar sistemas
    this.inputManager = new InputManager(canvas);
    this.audioManager = new AudioManager();
    
    // El jugador se inicializará después de configurar el canvas
    this.player = null;
    
    this.torchManager = new TorchManager();
    this.shadowManager = new ShadowManager();
    this.obstacleManager = new ObstacleManager();
    this.collisionManager = new CollisionManager();
    
    // Estado del juego
    this.score = 0;
    this.gameSpeed = this.config.INITIAL_GAME_SPEED;
    this.lastTime = 0;
    
    // Bind methods
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.gameLoop = this.gameLoop.bind(this);
    
    this.init();
  }
  
  init() {
    // Configurar canvas
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Inicializar input con preventDefault para evitar navegación del navegador
    this.inputManager.onKeyDown('Space', (e) => {
      e.preventDefault();
      this.placeTorch();
    });
    
    this.inputManager.onKeyDown('ArrowLeft', (e) => {
      e.preventDefault();
      this.player.moveLeft();
    });
    
    this.inputManager.onKeyDown('ArrowRight', (e) => {
      e.preventDefault();
      this.player.moveRight();
    });
    
    // El juego se inicia manualmente desde el botón COMENZAR
    // this.gameState.setState('playing');
    // this.gameLoop();
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Inicializar el jugador aquí, después de que el canvas tenga dimensiones
    if (!this.player) {
      this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
    } else {
      // Reposicionar el jugador existente
      this.player.x = this.canvas.width / 2;
      this.player.y = this.canvas.height - 100;
    }
    
    this.player.setBounds(0, this.canvas.width);
  }
  
  placeTorch() {
    if (this.player.energy >= this.config.TORCH_COST && this.gameState.isPlaying()) {
      this.torchManager.addTorch(this.player.x, this.player.y);
      this.player.consumeEnergy(this.config.TORCH_COST);
      this.audioManager.playSFX('torch_place');
    }
  }
  
  update(deltaTime) {
    if (!this.gameState.isPlaying()) {
      console.log('Update no se ejecuta - Estado:', this.gameState.getCurrentState());
      return;
    }
    console.log('Update ejecutándose - DeltaTime:', deltaTime);
    
    // Actualizar jugador
    this.player.update(deltaTime);
    
    // Spawn de obstáculos y sombras
    this.obstacleManager.spawnObstacles(this.gameSpeed, this.config.OBSTACLE_SPAWN_RATE);
    this.shadowManager.spawnShadows(this.config.SHADOW_SPEED);
    
    // Actualizar entidades
    this.torchManager.update(deltaTime, this.gameSpeed);
    this.obstacleManager.update(deltaTime, this.gameSpeed);
    this.shadowManager.update(deltaTime, this.gameSpeed, this.player);
    
    // Colisiones
    this.checkCollisions();
    
    // Lógica del juego
    this.updateGameLogic(deltaTime);
  }
  
  checkCollisions() {
    // Colisión con obstáculos
    if (this.collisionManager.checkPlayerObstacles(this.player, this.obstacleManager.obstacles)) {
      this.gameOver();
      return;
    }
    
    // Colisión con sombras
    if (this.collisionManager.checkPlayerShadows(this.player, this.shadowManager.shadows)) {
      this.gameOver();
      return;
    }
    
    // Sombras se alejan de antorchas
    this.shadowManager.avoidTorches(this.torchManager.torches);
  }
  
  updateGameLogic(deltaTime) {
    // Ganar energía al avanzar
    if (Math.random() < 0.01) {
      this.player.addEnergy(5);
    }
    
    // Aumentar puntuación
    this.score += 1;
    
    // Aumentar dificultad
    if (this.score % 1000 === 0) {
      this.gameSpeed += 0.1;
    }
  }
  
  render() {
    console.log('Render ejecutándose');
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Renderizar fondo
    this.renderBackground();
    
    // Renderizar entidades
    this.obstacleManager.render(this.ctx);
    this.torchManager.render(this.ctx);
    this.shadowManager.render(this.ctx);
    this.player.render(this.ctx);
    
    // Renderizar UI
    this.renderUI();
    
    // Renderizar game over si es necesario
    if (this.gameState.isGameOver()) {
      this.renderGameOver();
    }
  }
  
  renderBackground() {
    // Fondo degradado
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f3460");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Líneas del pasillo (efecto 3D)
    this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const y = (i * 50) % this.canvas.height;
      const width = 100 + (i * 10);
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvas.width/2 - width/2, y);
      this.ctx.lineTo(this.canvas.width/2 + width/2, y);
      this.ctx.stroke();
    }
  }
  
  renderUI() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "20px sans-serif";
    this.ctx.fillText(`Energía: ${this.player.energy}%`, 20, 40);
    this.ctx.fillText(`Antorchas: ${this.torchManager.torches.length}`, 20, 70);
    this.ctx.fillText(`Puntuación: ${this.score}`, 20, 100);
    this.ctx.fillText(`Velocidad: ${this.gameSpeed.toFixed(1)}`, 20, 130);
    
    // Barra de energía
    this.renderEnergyBar();
    
    // Instrucciones
    this.renderInstructions();
  }
  
  renderEnergyBar() {
    this.ctx.fillStyle = "rgba(255,255,255,0.3)";
    this.ctx.fillRect(20, 50, 100, 10);
    this.ctx.fillStyle = `hsl(${this.player.energy * 1.2}, 100%, 50%)`;
    this.ctx.fillRect(20, 50, this.player.energy, 10);
  }
  
  renderInstructions() {
    this.ctx.fillStyle = "rgba(255,255,255,0.7)";
    this.ctx.font = "16px sans-serif";
    this.ctx.fillText("ESPACIO: Antorcha (15 energía)", 20, this.canvas.height - 60);
    this.ctx.fillText("←→: Mover lateralmente", 20, this.canvas.height - 40);
  }
  
  renderGameOver() {
    // Overlay semi-transparente
    this.ctx.fillStyle = "rgba(0,0,0,0.9)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Título GAME OVER
    this.ctx.fillStyle = "red";
    this.ctx.font = "bold 48px sans-serif";
    this.ctx.fillText("GAME OVER", this.canvas.width/2 - 120, this.canvas.height/2 - 50);
    
    // Puntuación
    this.ctx.fillStyle = "white";
    this.ctx.font = "24px sans-serif";
    this.ctx.fillText(`Puntuación final: ${this.score}`, this.canvas.width/2 - 100, this.canvas.height/2);
    
    // Botón de restart
    this.renderRestartButton();
  }
  
  renderRestartButton() {
    const button = {
      x: this.canvas.width/2 - 100,
      y: this.canvas.height/2 + 50,
      width: 200,
      height: 50
    };
    
    // Fondo del botón
    this.ctx.fillStyle = "#4CAF50";
    this.ctx.fillRect(button.x, button.y, button.width, button.height);
    
    // Borde del botón
    this.ctx.strokeStyle = "#45a049";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(button.x, button.y, button.width, button.height);
    
    // Texto del botón
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 18px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("JUGAR DE NUEVO", button.x + button.width/2, button.y + button.height/2 + 6);
    this.ctx.textAlign = "left";
    
    // Guardar referencia del botón para click events
    this.restartButton = button;
  }
  
  start() {
    console.log('Iniciando juego...');
    console.log('Estado actual antes de start:', this.gameState.getCurrentState());
    console.log('Estados disponibles:', this.gameState.states);
    console.log('PLAYING state:', this.gameState.states.PLAYING);
    
    // Intentar usar el estado correcto
    const playingState = this.gameState.states.PLAYING || 'playing';
    console.log('Estado a usar:', playingState);
    
    this.gameState.setState(playingState);
    console.log('Estado actual después de start:', this.gameState.getCurrentState());
    console.log('¿Está jugando?', this.gameState.isPlaying());
    this.gameLoop();
    console.log('Game loop iniciado');
  }
  
  gameOver() {
    this.gameState.setState(this.gameState.states.GAME_OVER);
    this.audioManager.playSFX('game_over');
  }
  
  restart() {
    this.gameState.setState(this.gameState.states.PLAYING);
    this.score = 0;
    this.gameSpeed = this.config.INITIAL_GAME_SPEED;
    this.player.reset();
    this.torchManager.clear();
    this.shadowManager.clear();
    this.obstacleManager.clear();
  }
  
  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    console.log('Game loop ejecutándose - Frame:', currentTime);
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame(this.gameLoop);
  }
}
