export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 20;
    this.color = "white";
    this.energy = 100;
    this.maxEnergy = 100;
    this.moveSpeed = 30;
    this.minX = 0;
    this.maxX = window.innerWidth;
  }
  
  setBounds(minX, maxX) {
    this.minX = minX + this.r;
    this.maxX = maxX - this.r;
  }
  
  moveLeft() {
    this.x = Math.max(this.minX, this.x - this.moveSpeed);
  }
  
  moveRight() {
    this.x = Math.min(this.maxX, this.x + this.moveSpeed);
  }
  
  update(deltaTime) {
    // El jugador se mantiene en su posición Y fija
    // Solo se mueve lateralmente
  }
  
  render(ctx) {
    // Cuerpo del jugador
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Borde del jugador
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Indicador de energía en el jugador
    this.renderEnergyIndicator(ctx);
  }
  
  renderEnergyIndicator(ctx) {
    const barWidth = this.r * 2;
    const barHeight = 4;
    const barY = this.y - this.r - 10;
    
    // Fondo de la barra
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
    
    // Barra de energía
    const energyWidth = (this.energy / this.maxEnergy) * barWidth;
    ctx.fillStyle = `hsl(${this.energy * 1.2}, 100%, 50%)`;
    ctx.fillRect(this.x - barWidth/2, barY, energyWidth, barHeight);
    
    // Borde de la barra
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - barWidth/2, barY, barWidth, barHeight);
  }
  
  consumeEnergy(amount) {
    this.energy = Math.max(0, this.energy - amount);
  }
  
  addEnergy(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }
  
  hasEnergy(amount) {
    return this.energy >= amount;
  }
  
  reset() {
    this.energy = this.maxEnergy;
    this.x = (this.minX + this.maxX) / 2;
  }
  
  getBounds() {
    return {
      x: this.x - this.r,
      y: this.y - this.r,
      width: this.r * 2,
      height: this.r * 2
    };
  }
}
