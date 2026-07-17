export class GameState {
  constructor() {
    this.states = {
      MENU: 'menu',
      PLAYING: 'playing',
      PAUSED: 'paused',
      GAME_OVER: 'gameOver',
      VICTORY: 'victory',
      LOADING: 'loading'
    };
    
    this.currentState = this.states.MENU;
    this.previousState = null;
    this.stateHistory = [];
    
    // Callbacks para cambios de estado
    this.stateChangeCallbacks = {};
  }
  
  // Cambiar estado
  setState(newState) {
    if (!this.isValidState(newState)) {
      console.warn(`Estado inválido: ${newState}`);
      return false;
    }
    
    // Guardar estado anterior
    this.previousState = this.currentState;
    this.currentState = newState;
    
    // Agregar a historial
    this.stateHistory.push({
      state: newState,
      timestamp: Date.now()
    });
    
    // Limitar historial a 10 estados
    if (this.stateHistory.length > 10) {
      this.stateHistory.shift();
    }
    
    // Trigger callbacks
    this.triggerStateChangeCallbacks(newState, this.previousState);
    
    return true;
  }
  
  // Obtener estado actual
  getCurrentState() {
    return this.currentState;
  }
  
  // Obtener estado anterior
  getPreviousState() {
    return this.previousState;
  }
  
  // Verificar estado actual
  isState(state) {
    return this.currentState === state;
  }
  
  // Verificar si está en menú
  isMenu() {
    return this.currentState === this.states.MENU;
  }
  
  // Verificar si está jugando
  isPlaying() {
    return this.currentState === this.states.PLAYING;
  }
  
  // Verificar si está pausado
  isPaused() {
    return this.currentState === this.states.PAUSED;
  }
  
  // Verificar si el juego terminó
  isGameOver() {
    return this.currentState === this.states.GAME_OVER;
  }
  
  // Verificar si ganó
  isVictory() {
    return this.currentState === this.states.VICTORY;
  }
  
  // Verificar si está cargando
  isLoading() {
    return this.currentState === this.states.LOADING;
  }
  
  // Volver al estado anterior
  goBack() {
    if (this.previousState) {
      this.setState(this.previousState);
      return true;
    }
    return false;
  }
  
  // Volver al menú
  goToMenu() {
    this.setState(this.states.MENU);
  }
  
  // Pausar juego
  pause() {
    if (this.isPlaying()) {
      this.setState(this.states.PAUSED);
    }
  }
  
  // Reanudar juego
  resume() {
    if (this.isPaused()) {
      this.setState(this.states.PLAYING);
    }
  }
  
  // Toggle pause
  togglePause() {
    if (this.isPlaying()) {
      this.pause();
    } else if (this.isPaused()) {
      this.resume();
    }
  }
  
  // Callback system para cambios de estado
  onStateChange(state, callback) {
    if (!this.stateChangeCallbacks[state]) {
      this.stateChangeCallbacks[state] = [];
    }
    this.stateChangeCallbacks[state].push(callback);
  }
  
  onStateChangeTo(state, callback) {
    this.onStateChange(state, callback);
  }
  
  onStateChangeFrom(state, callback) {
    // Callback cuando se sale de un estado específico
    this.onStateChange(`exit_${state}`, callback);
  }
  
  triggerStateChangeCallbacks(newState, previousState) {
    // Callbacks para el nuevo estado
    if (this.stateChangeCallbacks[newState]) {
      this.stateChangeCallbacks[newState].forEach(callback => {
        try {
          callback(newState, previousState);
        } catch (error) {
          console.error('Error en callback de cambio de estado:', error);
        }
      });
    }
    
    // Callbacks para salir del estado anterior
    if (previousState && this.stateChangeCallbacks[`exit_${previousState}`]) {
      this.stateChangeCallbacks[`exit_${previousState}`].forEach(callback => {
        try {
          callback(newState, previousState);
        } catch (error) {
          console.error('Error en callback de salida de estado:', error);
        }
      });
    }
  }
  
  // Obtener estadísticas del estado
  getStateStats() {
    const stats = {};
    
    this.stateHistory.forEach(entry => {
      if (!stats[entry.state]) {
        stats[entry.state] = { count: 0, totalTime: 0 };
      }
      stats[entry.state].count++;
    });
    
    // Calcular tiempo total en cada estado
    for (let i = 0; i < this.stateHistory.length - 1; i++) {
      const current = this.stateHistory[i];
      const next = this.stateHistory[i + 1];
      const timeInState = next.timestamp - current.timestamp;
      
      if (!stats[current.state]) {
        stats[current.state] = { count: 0, totalTime: 0 };
      }
      stats[current.state].totalTime += timeInState;
    }
    
    return stats;
  }
  
  // Resetear historial
  resetHistory() {
    this.stateHistory = [];
    this.previousState = null;
  }
  
  // Obtener todos los estados disponibles
  getAvailableStates() {
    return Object.values(this.states);
  }
  
  // Verificar si un estado es válido
  isValidState(state) {
    return Object.values(this.states).includes(state);
  }
}
