export class TorchManager {
  constructor() {
    this.torches = [];
  }
  
  addTorch(x, y) {
    this.torches.push({
      x: x,
      y: y,
      life: 300,
      maxLife: 300,
      radius: 120,
      flicker: 0
    });
  }
  
  update(deltaTime, gameSpeed) {
    this.torches.forEach(torch => {
      // Reducir vida de la antorcha
      torch.life--;
      
      // Efecto de parpadeo
      torch.flicker += deltaTime * 0.01;
      
      // Mover la antorcha hacia arriba (efecto de movimiento hacia adelante)
      torch.y -= gameSpeed * 0.5;
    });
    
    // Eliminar antorchas muertas o muy atrás
    this.torches = this.torches.filter(torch => 
      torch.life > 0 && torch.y > -100
    );
  }
  
  render(ctx) {
    this.torches.forEach(torch => {
      this.renderTorch(ctx, torch);
    });
  }
  
  renderTorch(ctx, torch) {
    const alpha = torch.life / torch.maxLife;
    const radius = torch.radius * alpha;
    
    // Efecto de parpadeo
    const flickerIntensity = 0.1 * Math.sin(torch.flicker);
    const flickerAlpha = Math.max(0.1, alpha + flickerIntensity);
    
    // Luz de la antorcha
    const gradient = ctx.createRadialGradient(torch.x, torch.y, 10, torch.x, torch.y, radius);
    gradient.addColorStop(0, `rgba(255,200,100,${flickerAlpha * 0.9})`);
    gradient.addColorStop(0.5, `rgba(255,150,50,${flickerAlpha * 0.5})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(torch.x, torch.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Antorcha física
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(torch.x - 3, torch.y - 10, 6, 20);
    
    // Fuego de la antorcha
    ctx.fillStyle = `rgba(255,255,0,${flickerAlpha})`;
    ctx.beginPath();
    ctx.arc(torch.x, torch.y - 15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Indicador de vida de la antorcha
    this.renderLifeIndicator(ctx, torch);
  }
  
  renderLifeIndicator(ctx, torch) {
    const barWidth = 20;
    const barHeight = 3;
    const barX = torch.x - barWidth / 2;
    const barY = torch.y - 25;
    
    // Fondo de la barra
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Barra de vida
    const lifeWidth = (torch.life / torch.maxLife) * barWidth;
    ctx.fillStyle = `rgba(255,255,255,${torch.life / torch.maxLife})`;
    ctx.fillRect(barX, barY, lifeWidth, barHeight);
    
    // Borde de la barra
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
  
  getTorchesInRange(x, y, range) {
    return this.torches.filter(torch => {
      const distance = Math.sqrt((x - torch.x) ** 2 + (y - torch.y) ** 2);
      return distance <= range;
    });
  }
  
  clear() {
    this.torches = [];
  }
  
  getCount() {
    return this.torches.length;
  }
}
