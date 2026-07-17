const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Sistema de juego 3D
let player = { 
  x: canvas.width / 2, // posición lateral
  y: canvas.height - 100, // posición vertical fija
  r: 20, 
  color: "white",
  energy: 100 // energía para antorchas
};

let torches = [];
let shadows = []; // sombras que persiguen
let obstacles = []; // obstáculos en el camino
let gameOver = false;
let score = 0;
let gameSpeed = 2;

// Configuración del juego
const TORCH_COST = 15; // energía que cuesta cada antorcha
const SHADOW_SPEED = 1.5; // velocidad de las sombras
const OBSTACLE_SPAWN_RATE = 0.02; // probabilidad de spawn de obstáculos

// Variables para el botón de restart
let restartButton = {
  x: 0,
  y: 0,
  width: 200,
  height: 50,
  text: "JUGAR DE NUEVO"
};

document.addEventListener("keydown", e => {
  if (e.code === "Space" && player.energy >= TORCH_COST) placeTorch();
  if (e.code === "ArrowLeft") player.x = Math.max(player.r, player.x - 30);
  if (e.code === "ArrowRight") player.x = Math.min(canvas.width - player.r, player.x + 30);
});

// Event listener para clicks del mouse
canvas.addEventListener("click", handleClick);

function handleClick(e) {
  if (gameOver) {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    if (x > restartButton.x && x < restartButton.x + restartButton.width &&
        y > restartButton.y && y < restartButton.y + restartButton.height) {
      restartGame();
    }
  }
}

function restartGame() {
  // Resetear todas las variables del juego
  player = { 
    x: canvas.width / 2,
    y: canvas.height - 100,
    r: 20, 
    color: "white",
    energy: 100
  };
  
  torches = [];
  shadows = [];
  obstacles = [];
  gameOver = false;
  score = 0;
  gameSpeed = 2;
}

function placeTorch() {
  if (player.energy >= TORCH_COST) {
    torches.push({ 
      x: player.x, 
      y: player.y, 
      life: 300,
      radius: 120
    });
    player.energy -= TORCH_COST;
  }
}

function spawnObstacle() {
  if (Math.random() < OBSTACLE_SPAWN_RATE) {
    obstacles.push({
      x: Math.random() * (canvas.width - 100) + 50,
      y: -50,
      width: 60,
      height: 60,
      type: Math.random() < 0.7 ? 'rock' : 'tree'
    });
  }
}

function spawnShadow() {
  if (Math.random() < 0.01) { // 1% de probabilidad por frame
    shadows.push({
      x: Math.random() * canvas.width,
      y: -100,
      speed: SHADOW_SPEED + Math.random() * 0.5,
      size: 30 + Math.random() * 20
    });
  }
}

function update() {
  if (gameOver) return;

  // Spawn de obstáculos y sombras
  spawnObstacle();
  spawnShadow();

  // Actualizar obstáculos
  obstacles.forEach(o => o.y += gameSpeed);
  obstacles = obstacles.filter(o => o.y < canvas.height + 100);

  // Actualizar sombras
  shadows.forEach(s => {
    s.y += s.speed;
    
    // Las sombras se acercan al jugador
    if (s.x < player.x) s.x += 0.5;
    if (s.x > player.x) s.x -= 0.5;
  });
  shadows = shadows.filter(s => s.y < canvas.height + 100);

  // Actualizar antorchas
  torches.forEach(t => {
    t.life--;
    // Las antorchas se mueven hacia arriba (efecto de movimiento hacia adelante)
    t.y -= gameSpeed * 0.5;
  });
  torches = torches.filter(t => t.life > 0);

  // Colisión con obstáculos
  obstacles.forEach(o => {
    if (player.x < o.x + o.width && 
        player.x + player.r > o.x && 
        player.y < o.y + o.height && 
        player.y + player.r > o.y) {
      gameOver = true;
    }
  });

  // Colisión con sombras
  shadows.forEach(s => {
    let distance = Math.sqrt((player.x - s.x) ** 2 + (player.y - s.y) ** 2);
    if (distance < player.r + s.size) {
      gameOver = true;
    }
  });

  // Las sombras se alejan de las antorchas
  shadows.forEach(s => {
    torches.forEach(t => {
      let distance = Math.sqrt((s.x - t.x) ** 2 + (s.y - t.y) ** 2);
      if (distance < t.radius) {
        // La sombra se aleja de la antorcha
        let angle = Math.atan2(s.y - t.y, s.x - t.x);
        s.x += Math.cos(angle) * 2;
        s.y += Math.sin(angle) * 2;
      }
    });
  });

  // Ganar energía al avanzar
  if (Math.random() < 0.01) { // 1% de probabilidad por frame
    player.energy = Math.min(100, player.energy + 5);
  }

  // Aumentar puntuación
  score += 1;

  // Aumentar dificultad
  if (score % 1000 === 0) {
    gameSpeed += 0.1;
  }
}

function draw() {
  // Fondo degradado para efecto de pasillo
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(0.5, "#16213e");
  gradient.addColorStop(1, "#0f3460");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Líneas del pasillo (efecto 3D)
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    let y = (i * 50) % canvas.height;
    let width = 100 + (i * 10);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - width/2, y);
    ctx.lineTo(canvas.width/2 + width/2, y);
    ctx.stroke();
  }

  // Obstáculos
  obstacles.forEach(o => {
    ctx.fillStyle = o.type === 'rock' ? "#666" : "#2d5a27";
    ctx.fillRect(o.x, o.y, o.width, o.height);
    
    // Detalles de los obstáculos
    if (o.type === 'tree') {
      ctx.fillStyle = "#4a7c59";
      ctx.beginPath();
      ctx.arc(o.x + o.width/2, o.y + o.height/2, 25, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Antorchas
  torches.forEach(t => {
    let alpha = t.life / 300;
    let radius = t.radius * alpha;
    
    // Luz de la antorcha
    let gradient = ctx.createRadialGradient(t.x, t.y, 10, t.x, t.y, radius);
    gradient.addColorStop(0, "rgba(255,200,100,0.9)");
    gradient.addColorStop(0.5, "rgba(255,150,50,0.5)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Antorcha física
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(t.x - 3, t.y - 10, 6, 20);
    ctx.fillStyle = `rgba(255,255,0,${alpha})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y - 15, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Sombras
  shadows.forEach(s => {
    let alpha = 0.8;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Efecto de "ojos" en las sombras
    ctx.fillStyle = "rgba(255,0,0,0.8)";
    ctx.beginPath();
    ctx.arc(s.x - 8, s.y - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s.x + 8, s.y - 8, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Jugador
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  
  // Borde del jugador
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 2;
  ctx.stroke();

  // UI
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText(`Energía: ${player.energy}%`, 20, 40);
  ctx.fillText(`Antorchas: ${torches.length}`, 20, 70);
  ctx.fillText(`Puntuación: ${score}`, 20, 100);
  ctx.fillText(`Velocidad: ${gameSpeed.toFixed(1)}`, 20, 130);
  
  // Barra de energía
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(20, 50, 100, 10);
  ctx.fillStyle = `hsl(${player.energy * 1.2}, 100%, 50%)`;
  ctx.fillRect(20, 50, player.energy, 10);
  
  // Instrucciones
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "16px sans-serif";
  ctx.fillText("ESPACIO: Antorcha (15 energía)", 20, canvas.height - 60);
  ctx.fillText("←→: Mover lateralmente", 20, canvas.height - 40);

  if (gameOver) {
    // Overlay semi-transparente
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Título GAME OVER
    ctx.fillStyle = "red";
    ctx.font = "bold 48px sans-serif";
    ctx.fillText("GAME OVER", canvas.width/2 - 120, canvas.height/2 - 50);
    
    // Puntuación
    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText(`Puntuación final: ${score}`, canvas.width/2 - 100, canvas.height/2);
    
    // Botón de restart
    restartButton.x = canvas.width/2 - restartButton.width/2;
    restartButton.y = canvas.height/2 + 50;
    
    // Fondo del botón
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
    
    // Borde del botón
    ctx.strokeStyle = "#45a049";
    ctx.lineWidth = 3;
    ctx.strokeRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
    
    // Texto del botón
    ctx.fillStyle = "white";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(restartButton.text, restartButton.x + restartButton.width/2, restartButton.y + restartButton.height/2 + 6);
    
    // Resetear alineación del texto
    ctx.textAlign = "left";
    
    // Instrucción adicional
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "16px sans-serif";
    ctx.fillText("O haz clic en el botón verde", canvas.width/2 - 100, canvas.height/2 + 120);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
