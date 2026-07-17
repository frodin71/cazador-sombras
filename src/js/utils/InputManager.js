export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mouse = { x: 0, y: 0, pressed: false };
    this.touch = { x: 0, y: 0, pressed: false };
    this.callbacks = {
      keyDown: {},
      keyUp: {},
      mouseDown: {},
      mouseUp: {},
      mouseMove: {},
      touchStart: {},
      touchEnd: {},
      touchMove: {}
    };
    
    this.init();
  }
  
  init() {
    // Eventos de teclado
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Eventos de mouse
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    
    // Eventos de touch
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    
    // Prevenir scroll en móviles
    this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }
  
  // Event handlers
  handleKeyDown(e) {
    this.keys[e.code] = true;
    this.triggerCallbacks('keyDown', e.code, e);
  }
  
  handleKeyUp(e) {
    this.keys[e.code] = false;
    this.triggerCallbacks('keyUp', e.code, e);
  }
  
  handleMouseDown(e) {
    this.mouse.pressed = true;
    this.updateMousePosition(e);
    this.triggerCallbacks('mouseDown', 'mouse', e);
  }
  
  handleMouseUp(e) {
    this.mouse.pressed = false;
    this.updateMousePosition(e);
    this.triggerCallbacks('mouseUp', 'mouse', e);
  }
  
  handleMouseMove(e) {
    this.updateMousePosition(e);
    this.triggerCallbacks('mouseMove', 'mouse', e);
  }
  
  handleTouchStart(e) {
    this.touch.pressed = true;
    this.updateTouchPosition(e);
    this.triggerCallbacks('touchStart', 'touch', e);
  }
  
  handleTouchEnd(e) {
    this.touch.pressed = false;
    this.triggerCallbacks('touchEnd', 'touch', e);
  }
  
  handleTouchMove(e) {
    this.updateTouchPosition(e);
    this.triggerCallbacks('touchMove', 'touch', e);
  }
  
  updateMousePosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }
  
  updateTouchPosition(e) {
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = e.touches[0].clientX - rect.left;
      this.touch.y = e.touches[0].clientY - rect.top;
    }
  }
  
  // Callback system
  onKeyDown(key, callback) {
    if (!this.callbacks.keyDown[key]) {
      this.callbacks.keyDown[key] = [];
    }
    this.callbacks.keyDown[key].push(callback);
  }
  
  onKeyUp(key, callback) {
    if (!this.callbacks.keyUp[key]) {
      this.callbacks.keyUp[key] = [];
    }
    this.callbacks.keyUp[key].push(callback);
  }
  
  onMouseDown(callback) {
    this.callbacks.mouseDown.mouse = callback;
  }
  
  onMouseUp(callback) {
    this.callbacks.mouseUp.mouse = callback;
  }
  
  onMouseMove(callback) {
    this.callbacks.mouseMove.mouse = callback;
  }
  
  onTouchStart(callback) {
    this.callbacks.touchStart.touch = callback;
  }
  
  onTouchEnd(callback) {
    this.callbacks.touchEnd.touch = callback;
  }
  
  onTouchMove(callback) {
    this.callbacks.touchMove.touch = callback;
  }
  
  triggerCallbacks(type, key, event) {
    const callbacks = this.callbacks[type][key];
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }
  
  // Utility methods
  isKeyPressed(key) {
    return this.keys[key] || false;
  }
  
  isMousePressed() {
    return this.mouse.pressed;
  }
  
  isTouchPressed() {
    return this.touch.pressed;
  }
  
  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }
  
  getTouchPosition() {
    return { x: this.touch.x, y: this.touch.y };
  }
  
  // Check if any movement keys are pressed
  getMovementVector() {
    let x = 0;
    let y = 0;
    
    if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA')) x -= 1;
    if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD')) x += 1;
    if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW')) y -= 1;
    if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('KeyS')) y += 1;
    
    return { x, y };
  }
  
  // Check if action keys are pressed
  isActionPressed() {
    return this.isKeyPressed('Space') || this.isKeyPressed('Enter') || this.isMousePressed();
  }
  
  // Cleanup
  destroy() {
    // Remove event listeners if needed
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
  }
}
