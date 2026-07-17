export class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = {};
    this.currentMusic = null;
    this.masterVolume = 1.0;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.5;
    this.isMuted = false;
    
    // Audio context para efectos avanzados
    this.audioContext = null;
    this.initialized = false;
    
    this.init();
  }
  
  async init() {
    try {
      // Crear audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Precargar sonidos básicos
      await this.preloadSounds();
      
      this.initialized = true;
      console.log('AudioManager inicializado correctamente');
    } catch (error) {
      console.warn('AudioManager no pudo inicializarse:', error);
      this.initialized = false;
    }
  }
  
  async preloadSounds() {
    // Sonidos básicos del juego
    const basicSounds = {
      torch_place: { src: 'assets/audio/sfx/torch_place.mp3', volume: 0.8 },
      game_over: { src: 'assets/audio/sfx/game_over.mp3', volume: 1.0 },
      shadow_hit: { src: 'assets/audio/sfx/shadow_hit.mp3', volume: 0.6 },
      energy_pickup: { src: 'assets/audio/sfx/energy_pickup.mp3', volume: 0.7 },
      button_click: { src: 'assets/audio/sfx/button_click.mp3', volume: 0.5 }
    };
    
    // Música del juego
    const gameMusic = {
      menu: { src: 'assets/audio/music/menu_theme.mp3', volume: 0.4, loop: true },
      gameplay: { src: 'assets/audio/music/gameplay_theme.mp3', volume: 0.3, loop: true },
      game_over: { src: 'assets/audio/music/game_over_theme.mp3', volume: 0.5, loop: false }
    };
    
    // Precargar sonidos
    for (const [key, sound] of Object.entries(basicSounds)) {
      await this.loadSound(key, sound.src, sound.volume);
    }
    
    // Precargar música
    for (const [key, music] of Object.entries(gameMusic)) {
      await this.loadMusic(key, music.src, music.volume, music.loop);
    }
  }
  
  async loadSound(key, src, volume = 1.0) {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = volume * this.sfxVolume * this.masterVolume;
      
      // Crear promesa para cargar el audio
      const loadPromise = new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
      });
      
      audio.src = src;
      audio.load();
      
      await loadPromise;
      
      this.sounds[key] = {
        audio: audio,
        volume: volume,
        src: src
      };
      
      console.log(`Sonido cargado: ${key}`);
    } catch (error) {
      console.warn(`Error cargando sonido ${key}:`, error);
    }
  }
  
  async loadMusic(key, src, volume = 1.0, loop = false) {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = volume * this.musicVolume * this.masterVolume;
      audio.loop = loop;
      
      // Crear promesa para cargar el audio
      const loadPromise = new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
      });
      
      audio.src = src;
      audio.load();
      
      await loadPromise;
      
      this.music[key] = {
        audio: audio,
        volume: volume,
        src: src,
        loop: loop
      };
      
      console.log(`Música cargada: ${key}`);
    } catch (error) {
      console.warn(`Error cargando música ${key}:`, error);
    }
  }
  
  // Reproducir efectos de sonido
  playSFX(key) {
    if (!this.initialized || this.isMuted) return;
    
    const sound = this.sounds[key];
    if (sound) {
      try {
        // Clonar el audio para permitir múltiples reproducciones simultáneas
        const audioClone = sound.audio.cloneNode();
        audioClone.volume = sound.volume * this.sfxVolume * this.masterVolume;
        audioClone.play().catch(error => {
          console.warn(`Error reproduciendo SFX ${key}:`, error);
        });
      } catch (error) {
        console.warn(`Error reproduciendo SFX ${key}:`, error);
      }
    } else {
      console.warn(`Sonido no encontrado: ${key}`);
    }
  }
  
  // Reproducir música
  playMusic(key, fadeIn = true) {
    if (!this.initialized || this.isMuted) return;
    
    const music = this.music[key];
    if (music) {
      try {
        // Detener música actual si hay alguna
        if (this.currentMusic && this.currentMusic !== music) {
          this.stopMusic(fadeIn);
        }
        
        // Configurar nueva música
        music.audio.volume = music.volume * this.musicVolume * this.masterVolume;
        music.audio.currentTime = 0;
        
        if (fadeIn) {
          this.fadeInMusic(music.audio);
        }
        
        music.audio.play().catch(error => {
          console.warn(`Error reproduciendo música ${key}:`, error);
        });
        
        this.currentMusic = music;
      } catch (error) {
        console.warn(`Error reproduciendo música ${key}:`, error);
      }
    } else {
      console.warn(`Música no encontrada: ${key}`);
    }
  }
  
  // Detener música
  stopMusic(fadeOut = true) {
    if (this.currentMusic) {
      if (fadeOut) {
        this.fadeOutMusic(this.currentMusic.audio);
      } else {
        this.currentMusic.audio.pause();
        this.currentMusic.audio.currentTime = 0;
      }
      this.currentMusic = null;
    }
  }
  
  // Fade in de música
  fadeInMusic(audio, duration = 1000) {
    audio.volume = 0;
    const targetVolume = audio.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    
    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(audio.volume + volumeStep, targetVolume);
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }
  
  // Fade out de música
  fadeOutMusic(audio, duration = 1000) {
    const initialVolume = audio.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = initialVolume / steps;
    
    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(audio.volume - volumeStep, 0);
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = initialVolume;
      }
    }, stepDuration);
  }
  
  // Control de volumen
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }
  
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }
  
  updateAllVolumes() {
    // Actualizar volumen de sonidos
    Object.values(this.sounds).forEach(sound => {
      sound.audio.volume = sound.volume * this.sfxVolume * this.masterVolume;
    });
    
    // Actualizar volumen de música
    Object.values(this.music).forEach(music => {
      music.audio.volume = music.volume * this.musicVolume * this.masterVolume;
    });
  }
  
  // Mute/Unmute
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopMusic(false);
    }
    
    return this.isMuted;
  }
  
  mute() {
    this.isMuted = true;
    this.stopMusic(false);
  }
  
  unmute() {
    this.isMuted = false;
  }
  
  // Obtener estado del audio
  getAudioState() {
    return {
      initialized: this.initialized,
      muted: this.isMuted,
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      currentMusic: this.currentMusic ? this.currentMusic.src : null
    };
  }
  
  // Limpiar recursos
  destroy() {
    // Detener y limpiar música
    this.stopMusic(false);
    
    // Limpiar sonidos
    Object.values(this.sounds).forEach(sound => {
      sound.audio.pause();
      sound.audio.src = '';
    });
    
    // Limpiar música
    Object.values(this.music).forEach(music => {
      music.audio.pause();
      music.audio.src = '';
    });
    
    // Cerrar audio context
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.sounds = {};
    this.music = {};
    this.currentMusic = null;
    this.initialized = false;
  }
}
