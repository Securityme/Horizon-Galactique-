export interface FipStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  color: string;
  isSpaceSynth?: boolean;
}

export const FIP_STATIONS: FipStation[] = [
  {
    id: "fip-main",
    name: "FIP Direct",
    genre: "Éclectique & Découvertes",
    streamUrl: "https://icecast.radiofrance.fr/fip-midfi.mp3",
    color: "from-pink-500 to-rose-600"
  },
  {
    id: "fip-electro",
    name: "FIP Électro",
    genre: "Ambient, Chill, Downtempo",
    streamUrl: "https://icecast.radiofrance.fr/fipelectro-midfi.mp3",
    color: "from-cyan-500 to-blue-600"
  },
  {
    id: "fip-jazz",
    name: "FIP Jazz",
    genre: "Jazz, Bebop, Modern Fusion",
    streamUrl: "https://icecast.radiofrance.fr/fipjazz-midfi.mp3",
    color: "from-amber-500 to-orange-600"
  },
  {
    id: "fip-groove",
    name: "FIP Groove",
    genre: "Funk, Soul, Nu-Disco",
    streamUrl: "https://icecast.radiofrance.fr/fipgroove-midfi.mp3",
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: "fip-rock",
    name: "FIP Rock",
    genre: "Indie, Krautrock, Spaceway",
    streamUrl: "https://icecast.radiofrance.fr/fiprock-midfi.mp3",
    color: "from-red-600 to-rose-700"
  },
  {
    id: "soma-deepspace",
    name: "SomaFM Deep Space One",
    genre: "Ambient Spatial & Bruits de Fond",
    streamUrl: "https://icecast.somafm.com/deepspaceone-128-mp3",
    color: "from-indigo-600 to-purple-800"
  },
  {
    id: "soma-groovesalad",
    name: "SomaFM Groove Salad",
    genre: "Chilled Downtempo & Trip Hop",
    streamUrl: "https://icecast.somafm.com/groovesalad-128-mp3",
    color: "from-teal-500 to-emerald-700"
  },
  {
    id: "arche-synth",
    name: "Ondes Synthétiques de l'Arche",
    genre: "Générateur Ambiance Spatiale IA",
    streamUrl: "",
    color: "from-blue-600 to-cyan-500",
    isSpaceSynth: true
  }
];

class FipRadioManager {
  private audio: HTMLAudioElement | null = null;
  private currentStation: FipStation = FIP_STATIONS[0];
  private isPlaying: boolean = false;
  private isLoading: boolean = false;
  private volume: number = 0.6;
  private listeners: Set<() => void> = new Set();

  // Web Audio Synth nodes
  private audioCtx: AudioContext | null = null;
  private synthNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private masterGainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isFallbackSynthActive: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio();
      // DO NOT set crossOrigin="anonymous" on direct radio mp3 stream elements to avoid CORS blocks
      this.audio.volume = this.volume;

      const savedVol = localStorage.getItem("horizon_radio_volume");
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
        this.audio.volume = this.volume;
      }

      this.audio.addEventListener("loadstart", () => {
        this.isLoading = true;
        this.notify();
      });

      this.audio.addEventListener("playing", () => {
        this.isPlaying = true;
        this.isLoading = false;
        this.isFallbackSynthActive = false;
        this.notify();
      });

      this.audio.addEventListener("pause", () => {
        if (!this.isFallbackSynthActive) {
          this.isPlaying = false;
        }
        this.isLoading = false;
        this.notify();
      });

      this.audio.addEventListener("error", (e) => {
        console.warn("FIP Radio Live Stream issue, switching to Archon Ambient Space Synth...", e);
        this.isLoading = false;
        this.startFallbackSynth();
      });
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getStation(): FipStation {
    return this.currentStation;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsFallbackSynth(): boolean {
    return this.isFallbackSynthActive;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== "undefined") {
      localStorage.setItem("horizon_radio_volume", this.volume.toString());
    }
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    if (this.masterGainNode && this.audioCtx) {
      this.masterGainNode.gain.setValueAtTime(this.volume * 0.25, this.audioCtx.currentTime);
    }
    this.notify();
  }

  public playStation(station: FipStation) {
    this.currentStation = station;

    if (station.isSpaceSynth) {
      if (this.audio) {
        this.audio.pause();
        this.audio.src = "";
      }
      this.startFallbackSynth();
      return;
    }

    this.stopFallbackSynth();
    if (!this.audio) return;

    this.isLoading = true;
    this.notify();

    this.audio.src = station.streamUrl;
    this.audio.load();

    const promise = this.audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          this.isPlaying = true;
          this.isLoading = false;
          this.isFallbackSynthActive = false;
          this.notify();
        })
        .catch((err) => {
          console.warn("Autoplay or stream blocked. Starting Ambient Space Synth:", err);
          this.isLoading = false;
          this.startFallbackSynth();
        });
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      if (this.audio) {
        this.audio.pause();
      }
      this.stopFallbackSynth();
      this.isPlaying = false;
      this.isLoading = false;
    } else {
      if (this.currentStation.isSpaceSynth) {
        this.startFallbackSynth();
      } else if (this.audio) {
        if (!this.audio.src || this.audio.src === "") {
          this.audio.src = this.currentStation.streamUrl;
        }
        this.isLoading = true;
        this.notify();
        const promise = this.audio.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              this.isPlaying = true;
              this.isLoading = false;
              this.isFallbackSynthActive = false;
              this.notify();
            })
            .catch(() => {
              this.isLoading = false;
              this.startFallbackSynth();
            });
        }
      } else {
        this.startFallbackSynth();
      }
    }
    this.notify();
  }

  public startFallbackSynth() {
    if (typeof window === "undefined") return;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      this.stopFallbackSynth();

      // Polyphonic ambient chord drone (C minor / F minor 9th space pad)
      const frequencies = [130.81, 155.56, 196.00, 261.63, 392.00]; // C3, Eb3, G3, C4, G4

      this.masterGainNode = this.audioCtx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.volume * 0.25, this.audioCtx.currentTime);

      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = "lowpass";
      this.filterNode.frequency.setValueAtTime(450, this.audioCtx.currentTime);

      // Lowpass sweep effect
      this.filterNode.frequency.exponentialRampToValueAtTime(850, this.audioCtx.currentTime + 8);

      frequencies.forEach((freq, idx) => {
        if (!this.audioCtx || !this.filterNode) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        // Soft detune for analog warmth
        osc.detune.setValueAtTime((idx - 2) * 4, this.audioCtx.currentTime);

        const oscGainVal = (0.2 / frequencies.length) * (idx === 0 ? 1.5 : 1.0);
        gain.gain.setValueAtTime(oscGainVal, this.audioCtx.currentTime);

        osc.connect(gain);
        gain.connect(this.filterNode);
        osc.start();

        this.synthNodes.push({ osc, gain });
      });

      this.filterNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.audioCtx.destination);

      this.isFallbackSynthActive = true;
      this.isPlaying = true;
      this.isLoading = false;
    } catch (e) {
      console.warn("Audio Context Synth initialization error:", e);
    }
    this.notify();
  }

  public stopFallbackSynth() {
    this.synthNodes.forEach(({ osc, gain }) => {
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch {}
    });
    this.synthNodes = [];
    if (this.filterNode) {
      try {
        this.filterNode.disconnect();
      } catch {}
      this.filterNode = null;
    }
    if (this.masterGainNode) {
      try {
        this.masterGainNode.disconnect();
      } catch {}
      this.masterGainNode = null;
    }
    this.isFallbackSynthActive = false;
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
    }
    this.stopFallbackSynth();
    this.isPlaying = false;
    this.isLoading = false;
    this.notify();
  }
}

export const fipRadio = new FipRadioManager();


