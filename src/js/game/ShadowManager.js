export class ShadowManager {
  constructor() {
    this.shadows = [];
    this.spawnTimer = 0;
  }
  
  spawnShadows(shadowSpeed) {
    this.spawnTimer++;
    
    // 1% de probabilidad por frame
    if (Math.random() < 0.01) {
      this.shadows.push({
        x: Math.random() * window.innerWidth,
        y: -100,
        speed: shadowSpeed + Math.random() * 0.5,
        size: 30 + Math.random() * 20,
        targetX: 0,
        targetY: 0,
        state: 'hunting', // hunting, fleeing, stunned
        stunTimer: 0,
        pulse: 0
      });
    }
  }
  
  update(deltaTime, gameSpeed, player) {
    this.shadows.forEach(shadow => {
      // Actualizar timer de stun
      if (shadow.state === 'stunned') {
        shadow.stunTimer--;
        if (shadow.stunTimer <= 0) {
          shadow.state = 'hunting';
        }
      }
      
      // Efecto de pulso
      shadow.pulse += deltaTime * 0.02;
      
      // Mover sombra
      if (shadow.state !== 'stunned') {
        shadow.y += shadow.speed;
        
        // Las sombras se acercan al jugador
        if (shadow.state === 'hunting') {
          if (shadow.x < player.x) shadow.x += 0.5;
          if (shadow.x > player.x) shadow.x -= 0.5;
        }
      }
    });
    
    // Eliminar sombras que salen de la pantalla
    this.shadows = this.shadows.filter(shadow => shadow.y < window.innerHeight + 100);
  }
  
  render(ctx) {
    this.shadows.forEach(shadow => {
      this.renderShadow(ctx, shadow);
    });
  }
  
  renderShadow(ctx, shadow) {
    const alpha = shadow.state === 'stunned' ? 0.4 : 0.8;
    const pulseSize = Math.sin(shadow.pulse) * 2;
    
    // Sombra principal
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.arc(shadow.x, shadow.y, shadow.size + pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Efecto de aura oscura
    const auraGradient = ctx.createRadialGradient(
      shadow.x, shadow.y, shadow.size * 0.5,
      shadow.x, shadow.y, shadow.size * 1.5
    );
    auraGradient.addColorStop(0, `rgba(0,0,0,${alpha * 0.3})`);
    auraGradient.addColorStop(1, "rgba(0,0,0,0)");
    
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(shadow.x, shadow.y, shadow.size * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Ojos de la sombra
    this.renderShadowEyes(ctx, shadow);
    
    // Efecto de stun
    if (shadow.state === 'stunned') {
      this.renderStunEffect(ctx, shadow);
    }
  }
  
  renderShadowEyes(ctx, shadow) {
    const eyeSize = shadow.size * 0.1;
    const eyeOffset = shadow.size * 0.25;
    
    // Ojo izquierdo
    ctx.fillStyle = shadow.state === 'hunting' ? "rgba(255,0,0,0.8)" : "rgba(255,255,0,0.6)";
    ctx.beginPath();
    ctx.arc(shadow.x - eyeOffset, shadow.y - eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Ojo derecho
    ctx.beginPath();
    ctx.arc(shadow.x + eyeOffset, shadow.y - eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupilas
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.beginPath();
    ctx.arc(shadow.x - eyeOffset, shadow.y - eyeOffset, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(shadow.x + eyeOffset, shadow.y - eyeOffset, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  renderStunEffect(ctx, shadow) {
    // Estrellas de stun
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2 / 3) + shadow.pulse;
      const x = shadow.x + Math.cos(angle) * (shadow.size + 10);
      const y = shadow.y + Math.sin(angle) * (shadow.size + 10);
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  avoidTorches(torches) {
    this.shadows.forEach(shadow => {
      torches.forEach(torch => {
        const distance = Math.sqrt((shadow.x - torch.x) ** 2 + (shadow.y - torch.y) ** 2);
        
        if (distance < torch.radius && shadow.state !== 'stunned') {
          // La sombra se aleja de la antorcha
          const angle = Math.atan2(shadow.y - torch.y, shadow.x - torch.x);
          shadow.x += Math.cos(angle) * 3;
          shadow.y += Math.sin(angle) * 3;
          
          // Cambiar estado a fleeing temporalmente
          shadow.state = 'fleeing';
          
          // Stun temporal si está muy cerca
          if (distance < torch.radius * 0.5) {
            shadow.state = 'stunned';
            shadow.stunTimer = 60; // 1 segundo a 60fps
          }
        }
      });
      
      // Volver a hunting después de un tiempo
      if (shadow.state === 'fleeing' && Math.random() < 0.01) {
        shadow.state = 'hunting';
      }
    });
  }
  
  getShadowsInRange(x, y, range) {
    return this.shadows.filter(shadow => {
      const distance = Math.sqrt((x - shadow.x) ** 2 + (y - shadow.y) ** 2);
      return distance <= range;
    });
  }
  
  clear() {
    this.shadows = [];
  }
  
  getCount() {
    return this.shadows.length;
  }
}
