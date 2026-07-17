export class ObstacleManager {
  constructor() {
    this.obstacles = [];
    this.obstacleTypes = [
      { type: 'rock', color: '#666', width: 60, height: 60, frequency: 0.7 },
      { type: 'tree', color: '#2d5a27', width: 60, height: 60, frequency: 0.3 }
    ];
  }
  
  spawnObstacles(gameSpeed, spawnRate) {
    if (Math.random() < spawnRate) {
      const obstacleType = this.selectObstacleType();
      const x = Math.random() * (window.innerWidth - obstacleType.width - 100) + 50;
      
      this.obstacles.push({
        x: x,
        y: -obstacleType.height,
        width: obstacleType.width,
        height: obstacleType.height,
        type: obstacleType.type,
        color: obstacleType.color,
        rotation: 0,
        scale: 1 + Math.random() * 0.2
      });
    }
  }
  
  selectObstacleType() {
    const random = Math.random();
    let cumulative = 0;
    
    for (const type of this.obstacleTypes) {
      cumulative += type.frequency;
      if (random <= cumulative) {
        return type;
      }
    }
    
    return this.obstacleTypes[0]; // fallback
  }
  
  update(deltaTime, gameSpeed) {
    this.obstacles.forEach(obstacle => {
      // Mover obstáculo hacia abajo
      obstacle.y += gameSpeed;
      
      // Efecto de rotación sutil
      obstacle.rotation += deltaTime * 0.001;
      
      // Efecto de escala (respiración)
      obstacle.scale = 1 + Math.sin(obstacle.rotation * 2) * 0.05;
    });
    
    // Eliminar obstáculos que salen de la pantalla
    this.obstacles = this.obstacles.filter(obstacle => 
      obstacle.y < window.innerHeight + 100
    );
  }
  
  render(ctx) {
    this.obstacles.forEach(obstacle => {
      this.renderObstacle(ctx, obstacle);
    });
  }
  
  renderObstacle(ctx, obstacle) {
    ctx.save();
    
    // Aplicar transformaciones
    ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    ctx.rotate(obstacle.rotation);
    ctx.scale(obstacle.scale, obstacle.scale);
    
    // Renderizar según el tipo
    if (obstacle.type === 'rock') {
      this.renderRock(ctx, obstacle);
    } else if (obstacle.type === 'tree') {
      this.renderTree(ctx, obstacle);
    }
    
    ctx.restore();
  }
  
  renderRock(ctx, obstacle) {
    const x = -obstacle.width / 2;
    const y = -obstacle.height / 2;
    
    // Sombra
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(x + 2, y + 2, obstacle.width, obstacle.height);
    
    // Roca principal
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(x, y, obstacle.width, obstacle.height);
    
    // Detalles de la roca
    ctx.fillStyle = "#555";
    ctx.fillRect(x + 5, y + 5, obstacle.width - 10, 8);
    ctx.fillRect(x + 8, y + 20, obstacle.width - 16, 6);
    ctx.fillRect(x + 12, y + 35, obstacle.width - 24, 4);
  }
  
  renderTree(ctx, obstacle) {
    const x = -obstacle.width / 2;
    const y = -obstacle.height / 2;
    
    // Sombra
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(x + 2, y + 2, obstacle.width, obstacle.height);
    
    // Tronco
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x + obstacle.width / 2 - 8, y + obstacle.height / 2, 16, obstacle.height / 2);
    
    // Copa del árbol
    ctx.fillStyle = "#4a7c59";
    ctx.beginPath();
    ctx.arc(0, y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Detalles de las hojas
    ctx.fillStyle = "#3d6b4a";
    ctx.beginPath();
    ctx.arc(-5, y + obstacle.height / 2 - 5, obstacle.width / 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(5, y + obstacle.height / 2 - 8, obstacle.width / 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  getObstaclesInRange(x, y, range) {
    return this.obstacles.filter(obstacle => {
      const obstacleCenterX = obstacle.x + obstacle.width / 2;
      const obstacleCenterY = obstacle.y + obstacle.height / 2;
      const distance = Math.sqrt((x - obstacleCenterX) ** 2 + (y - obstacleCenterY) ** 2);
      return distance <= range;
    });
  }
  
  clear() {
    this.obstacles = [];
  }
  
  getCount() {
    return this.obstacles.length;
  }
}
