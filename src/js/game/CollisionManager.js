export class CollisionManager {
  constructor() {
    // Configuración de colisiones
    this.collisionTypes = {
      CIRCLE_RECT: 'circle_rect',
      CIRCLE_CIRCLE: 'circle_circle',
      RECT_RECT: 'rect_rect'
    };
  }
  
  checkPlayerObstacles(player, obstacles) {
    const playerBounds = player.getBounds();
    
    for (const obstacle of obstacles) {
      if (this.checkCircleRectCollision(
        player.x, player.y, player.r,
        obstacle.x, obstacle.y, obstacle.width, obstacle.height
      )) {
        return true;
      }
    }
    
    return false;
  }
  
  checkPlayerShadows(player, shadows) {
    for (const shadow of shadows) {
      if (this.checkCircleCircleCollision(
        player.x, player.y, player.r,
        shadow.x, shadow.y, shadow.size
      )) {
        return true;
      }
    }
    
    return false;
  }
  
  checkCircleRectCollision(circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight) {
    // Encontrar el punto más cercano al círculo dentro del rectángulo
    const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
    
    // Calcular la distancia entre el centro del círculo y el punto más cercano
    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;
    
    // Si la distancia es menor que el radio, hay colisión
    return (distanceX * distanceX + distanceY * distanceY) < (circleRadius * circleRadius);
  }
  
  checkCircleCircleCollision(x1, y1, r1, x2, y2, r2) {
    const distanceX = x1 - x2;
    const distanceY = y1 - y2;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    return distance < (r1 + r2);
  }
  
  checkRectRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }
  
  // Colisión con margen (para efectos visuales)
  checkCollisionWithMargin(obj1, obj2, margin = 0) {
    if (obj1.type === 'circle' && obj2.type === 'circle') {
      return this.checkCircleCircleCollision(
        obj1.x, obj1.y, obj1.radius + margin,
        obj2.x, obj2.y, obj2.radius + margin
      );
    }
    
    if (obj1.type === 'circle' && obj2.type === 'rect') {
      return this.checkCircleRectCollision(
        obj1.x, obj1.y, obj1.radius + margin,
        obj2.x, obj2.y, obj2.width, obj2.height
      );
    }
    
    return false;
  }
  
  // Obtener dirección de colisión para efectos de rebote
  getCollisionDirection(obj1, obj2) {
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: 0, y: 1 };
    
    return {
      x: dx / distance,
      y: dy / distance
    };
  }
  
  // Verificar si un punto está dentro de un área
  isPointInArea(x, y, areaX, areaY, areaWidth, areaHeight) {
    return x >= areaX && x <= areaX + areaWidth && y >= areaY && y <= areaY + areaHeight;
  }
  
  // Verificar si un objeto está completamente dentro de un área
  isObjectInArea(obj, areaX, areaY, areaWidth, areaHeight) {
    if (obj.type === 'circle') {
      return obj.x - obj.radius >= areaX && 
             obj.x + obj.radius <= areaX + areaWidth &&
             obj.y - obj.radius >= areaY && 
             obj.y + obj.radius <= areaY + areaHeight;
    }
    
    if (obj.type === 'rect') {
      return obj.x >= areaX && 
             obj.x + obj.width <= areaX + areaWidth &&
             obj.y >= areaY && 
             obj.y + obj.height <= areaY + areaHeight;
    }
    
    return false;
  }
}
