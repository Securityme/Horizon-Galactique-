class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted = false;
  private volume = 0.5;

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.08, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.08, this.ctx.currentTime);
    }
  }

  public startAmbient(): void {
    const ctx = this.initContext();
    if (!ctx || this.ambientOsc1) return;

    try {
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.08, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(160, ctx.currentTime);

      this.ambientOsc1 = ctx.createOscillator();
      this.ambientOsc1.type = "sine";
      this.ambientOsc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 bass drone

      this.ambientOsc2 = ctx.createOscillator();
      this.ambientOsc2.type = "triangle";
      this.ambientOsc2.frequency.setValueAtTime(110.5, ctx.currentTime); // slightly detuned harmonic

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(ctx.destination);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
    } catch (e) {
      console.warn("Ambient audio init ignored:", e);
    }
  }

  public stopAmbient(): void {
    try {
      if (this.ambientOsc1) {
        this.ambientOsc1.stop();
        this.ambientOsc1.disconnect();
        this.ambientOsc1 = null;
      }
      if (this.ambientOsc2) {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
        this.ambientOsc2 = null;
      }
    } catch {}
  }

  public playBlip(freq = 440, duration = 0.08): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  public playDiceRoll(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          this.playBlip(300 + Math.random() * 400, 0.04);
        }, i * 45);
      }
    } catch {}
  }

  public playSuccessFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playBlip(note, 0.25);
      }, index * 90);
    });
  }

  public playCriticalAlert(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.playBlip(220, 0.18);
    setTimeout(() => this.playBlip(196, 0.25), 120);
  }
}

export const audioService = new AudioEngine();

/**
 * FIP Radio Service Singleton for Radio France live streams.
 */
export class FipRadioService {
  private static instance: FipRadioService;
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private isUnavailable: boolean = false;
  private readonly streamUrl = "https://icecast.radiofrance.fr/fip-midfi.mp3";

  private constructor() {}

  public static getInstance(): FipRadioService {
    if (!FipRadioService.instance) {
      FipRadioService.instance = new FipRadioService();
    }
    return FipRadioService.instance;
  }

  public init(): void {
    if (typeof window === "undefined" || this.audio) return;

    this.audio = new Audio();
    this.audio.preload = "none";
    this.audio.crossOrigin = "anonymous";

    this.audio.addEventListener("error", () => {
      this.isPlaying = false;
      this.isUnavailable = true;
    });

    this.audio.addEventListener("playing", () => {
      this.isPlaying = true;
      this.isUnavailable = false;
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
    });
  }

  public async toggle(): Promise<{ playing: boolean; unavailable: boolean }> {
    this.init();
    if (!this.audio) return { playing: false, unavailable: true };

    if (this.isPlaying) {
      this.audio.pause();
      this.audio.src = ""; // Cleanly release network connection
      this.isPlaying = false;
      return { playing: false, unavailable: false };
    } else {
      try {
        this.audio.src = this.streamUrl;
        await this.audio.play();
        this.isPlaying = true;
        this.isUnavailable = false;
        return { playing: true, unavailable: false };
      } catch {
        this.isPlaying = false;
        this.isUnavailable = true;
        return { playing: false, unavailable: true };
      }
    }
  }

  public getStatus(): { playing: boolean; unavailable: boolean } {
    return { playing: this.isPlaying, unavailable: this.isUnavailable };
  }
}

export const fipRadio = FipRadioService.getInstance();

