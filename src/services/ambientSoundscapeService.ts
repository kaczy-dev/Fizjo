// Web Audio API procedural ambient soundscape synthesizer
// Provides zero-dependency, offline-ready nature sounds and binaural beats for focus during neck rehab exercises

export type SoundscapeType = 
  | 'binaural_alpha'
  | 'binaural_theta'
  | 'ocean_waves'
  | 'forest_rain'
  | 'mountain_stream'
  | 'zen_singing_bowl';

export interface SoundscapePreset {
  id: SoundscapeType;
  name: string;
  category: 'binaural' | 'nature' | 'meditation';
  shortDesc: string;
  clinicalBenefit: string;
  icon: string;
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'binaural_alpha',
    name: 'Fale Alfa (10 Hz)',
    category: 'binaural',
    shortDesc: 'Binaural beats 10 Hz na bazie 216 Hz',
    clinicalBenefit: 'Aktywuje fale alfa w korze mózgowej, poprawia skupienie na technice ruchu i obniża odczuwanie bólu',
    icon: '🧠'
  },
  {
    id: 'binaural_theta',
    name: 'Fale Theta (6 Hz)',
    category: 'binaural',
    shortDesc: 'Głęboka dekompresja i relaksacja 6 Hz',
    clinicalBenefit: 'Hamuje pobudzenie układu współczulnego, rozluźniając odruchowe napięcie mięśni podpotylicznych',
    icon: '✨'
  },
  {
    id: 'ocean_waves',
    name: 'Szum Fal Oceanu',
    category: 'nature',
    shortDesc: 'Rytmiczny, 8-sekundowy przypływ fal',
    clinicalBenefit: 'Rytm przypływu harmonizuje z torem oddechowym 4-4, wspomagając mobilizację klatki piersiowej',
    icon: '🌊'
  },
  {
    id: 'forest_rain',
    name: 'Kojący Deszcz w Lesie',
    category: 'nature',
    shortDesc: 'Różowy szum i miękkie krople na liściach',
    clinicalBenefit: 'Skutecznie maskuje dystraktory z otoczenia biurowego i łagodzi szumy uszne (tinnitus)',
    icon: '🌧️'
  },
  {
    id: 'mountain_stream',
    name: 'Górski Potok',
    category: 'nature',
    shortDesc: 'Spokojny nurt wody płynącej po kamieniach',
    clinicalBenefit: 'Biało-różowe spektrum częstotliwości ułatwia skupienie proprioceptywne podczas izometrii szyi',
    icon: '💧'
  },
  {
    id: 'zen_singing_bowl',
    name: 'Misa Tybetańska (432 Hz)',
    category: 'meditation',
    shortDesc: 'Harmonijny ton 432 Hz z rezonansem',
    clinicalBenefit: 'Rezonans akustyczny stymulujący nerw błędny, sprzyjający obniżeniu tonusu mięśni czworobocznych',
    icon: '🔔'
  }
];

export interface SoundscapeState {
  isPlaying: boolean;
  activePresetId: SoundscapeType;
  volume: number; // 0 to 1
}

class AmbientSoundscapeService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activePresetId: SoundscapeType = 'binaural_alpha';
  private isPlayingState: boolean = false;
  private volumeLevel: number = 0.45;
  private activeNodes: Array<{ stop?: () => void; disconnect?: () => void }> = [];
  private lfoIntervalId: number | null = null;
  private listeners: Set<(state: SoundscapeState) => void> = new Set();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private notify() {
    const state: SoundscapeState = {
      isPlaying: this.isPlayingState,
      activePresetId: this.activePresetId,
      volume: this.volumeLevel
    };
    this.listeners.forEach(cb => cb(state));
  }

  public subscribe(callback: (state: SoundscapeState) => void): () => void {
    this.listeners.add(callback);
    callback({
      isPlaying: this.isPlayingState,
      activePresetId: this.activePresetId,
      volume: this.volumeLevel
    });
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getState(): SoundscapeState {
    return {
      isPlaying: this.isPlayingState,
      activePresetId: this.activePresetId,
      volume: this.volumeLevel
    };
  }

  public setVolume(vol: number) {
    this.volumeLevel = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setTargetAtTime(this.volumeLevel, this.ctx.currentTime, 0.05);
      } catch {
        // Audio node error safe fallback
      }
    }
    this.notify();
  }

  public setPreset(presetId: SoundscapeType) {
    const changed = this.activePresetId !== presetId;
    this.activePresetId = presetId;
    if (changed && this.isPlayingState) {
      this.stopCurrentAudio();
      this.startPreset(presetId);
    }
    this.notify();
  }

  public togglePlay(): boolean {
    if (this.isPlayingState) {
      this.pause();
      return false;
    } else {
      this.play(this.activePresetId);
      return true;
    }
  }

  public play(presetId?: SoundscapeType) {
    if (presetId) {
      this.activePresetId = presetId;
    }
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.isPlayingState) {
      this.stopCurrentAudio();
    }

    this.startPreset(this.activePresetId);
    this.isPlayingState = true;
    this.notify();
  }

  public pause() {
    this.stopCurrentAudio();
    this.isPlayingState = false;
    this.notify();
  }

  public stop() {
    this.pause();
  }

  private stopCurrentAudio() {
    if (this.lfoIntervalId !== null) {
      window.clearInterval(this.lfoIntervalId);
      this.lfoIntervalId = null;
    }

    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // Node already terminated
      }
    });
    this.activeNodes = [];

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // Safe disconnect
      }
      this.masterGain = null;
    }
  }

  private createMasterGain(ctx: AudioContext): GainNode {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volumeLevel, ctx.currentTime);
    gain.connect(ctx.destination);
    this.masterGain = gain;
    return gain;
  }

  private startPreset(preset: SoundscapeType) {
    const ctx = this.getContext();
    if (!ctx) return;

    const master = this.createMasterGain(ctx);

    switch (preset) {
      case 'binaural_alpha':
        this.buildBinaural(ctx, master, 216, 10); // 216Hz carrier, 10Hz beat (Alpha)
        break;
      case 'binaural_theta':
        this.buildBinaural(ctx, master, 192, 6); // 192Hz carrier, 6Hz beat (Theta)
        break;
      case 'ocean_waves':
        this.buildOceanWaves(ctx, master);
        break;
      case 'forest_rain':
        this.buildForestRain(ctx, master);
        break;
      case 'mountain_stream':
        this.buildMountainStream(ctx, master);
        break;
      case 'zen_singing_bowl':
        this.buildZenDrone(ctx, master);
        break;
      default:
        this.buildBinaural(ctx, master, 216, 10);
        break;
    }
  }

  /**
   * Generates pure stereo binaural beats using separate left/right audio channels
   */
  private buildBinaural(ctx: AudioContext, master: GainNode, baseFreq: number, beatFreq: number) {
    const merger = ctx.createChannelMerger(2);

    // Left Ear Oscillator
    const oscLeft = ctx.createOscillator();
    const gainLeft = ctx.createGain();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    gainLeft.gain.setValueAtTime(0.28, ctx.currentTime);
    oscLeft.connect(gainLeft);
    gainLeft.connect(merger, 0, 0); // connect to left channel

    // Right Ear Oscillator (baseFreq + beatFreq)
    const oscRight = ctx.createOscillator();
    const gainRight = ctx.createGain();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);
    gainRight.gain.setValueAtTime(0.28, ctx.currentTime);
    oscRight.connect(gainRight);
    gainRight.connect(merger, 0, 1); // connect to right channel

    // Sub-harmonic warm base pad (subtle octave below for rich listening comfort)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq / 2, ctx.currentTime);
    subGain.gain.setValueAtTime(0.08, ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(master);

    // Filter to warm the binaural beats
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    merger.connect(filter);
    filter.connect(master);

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    this.activeNodes.push(oscLeft, oscRight, subOsc, gainLeft, gainRight, subGain, merger, filter);
  }

  /**
   * Generates rhythmic ocean surf using modulated pink/brown noise with 8s breath cycle
   */
  private buildOceanWaves(ctx: AudioContext, master: GainNode) {
    const noiseBuffer = this.generatePinkNoiseBuffer(ctx, 5);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Resonant bandpass filter
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(320, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.3, ctx.currentTime);

    // LFO Oscillator to rhythmically swell the ocean waves (0.125 Hz = 8 seconds per breath wave)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.125, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(240, ctx.currentTime); // Filter frequency modulation range

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    // Volume modulation for wave peak
    const lfoAmp = ctx.createGain();
    lfoAmp.gain.setValueAtTime(0.2, ctx.currentTime);
    lfo.connect(lfoAmp);
    lfoAmp.connect(waveGain.gain);

    noiseSource.connect(bandpass);
    bandpass.connect(waveGain);
    waveGain.connect(master);

    noiseSource.start();
    lfo.start();

    this.activeNodes.push(noiseSource, bandpass, waveGain, lfo, lfoGain, lfoAmp);
  }

  /**
   * Generates forest rain with pink noise bed and intermittent raindrop resonance
   */
  private buildForestRain(ctx: AudioContext, master: GainNode) {
    const noiseBuffer = this.generatePinkNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to sound like soft rainfall on canopy
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1400, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.32, ctx.currentTime);

    noiseSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(master);

    noiseSource.start();
    this.activeNodes.push(noiseSource, rainFilter, rainGain);

    // Random soft droplets generator (leaves dripping)
    const dropInterval = window.setInterval(() => {
      if (!this.isPlayingState || !this.ctx) return;
      try {
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const freq = 1200 + Math.random() * 1600;
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        dropOsc.frequency.exponentialRampToValueAtTime(freq * 0.7, this.ctx.currentTime + 0.08);

        dropGain.gain.setValueAtTime(0.015 + Math.random() * 0.02, this.ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

        dropOsc.connect(dropGain);
        dropGain.connect(master);

        dropOsc.start();
        dropOsc.stop(this.ctx.currentTime + 0.09);
      } catch {
        // Safe droplet cleanup
      }
    }, 180);

    this.lfoIntervalId = dropInterval;
  }

  /**
   * Generates mountain water stream with dual bubbling resonances
   */
  private buildMountainStream(ctx: AudioContext, master: GainNode) {
    const noiseBuffer = this.generatePinkNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(650, ctx.currentTime);
    filter1.Q.setValueAtTime(2.5, ctx.currentTime);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'bandpass';
    filter2.frequency.setValueAtTime(1450, ctx.currentTime);
    filter2.Q.setValueAtTime(2.0, ctx.currentTime);

    const streamGain = ctx.createGain();
    streamGain.gain.setValueAtTime(0.28, ctx.currentTime);

    // Gentle modulation for natural bubbling turbulence
    const lfo1 = ctx.createOscillator();
    lfo1.type = 'sine';
    lfo1.frequency.setValueAtTime(0.7, ctx.currentTime);
    const lfoGain1 = ctx.createGain();
    lfoGain1.gain.setValueAtTime(120, ctx.currentTime);
    lfo1.connect(lfoGain1);
    lfoGain1.connect(filter1.frequency);

    noiseSource.connect(filter1);
    noiseSource.connect(filter2);
    filter1.connect(streamGain);
    filter2.connect(streamGain);
    streamGain.connect(master);

    noiseSource.start();
    lfo1.start();

    this.activeNodes.push(noiseSource, filter1, filter2, streamGain, lfo1, lfoGain1);
  }

  /**
   * Generates a peaceful 432 Hz Tibetan singing bowl resonant drone
   */
  private buildZenDrone(ctx: AudioContext, master: GainNode) {
    // 432 Hz fundamental and harmonic series (432Hz, 864Hz, 216Hz sub)
    const freqs = [216, 432, 648, 864];
    const amplitudes = [0.18, 0.22, 0.06, 0.04];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'sine';
      // Slight chorus detune for shimmering acoustic warmth
      const detuneAmount = (idx % 2 === 0 ? 1 : -1) * (0.8 + idx * 0.4);
      osc.frequency.setValueAtTime(freq + detuneAmount, ctx.currentTime);

      gain.gain.setValueAtTime(amplitudes[idx], ctx.currentTime);

      if (pan) {
        pan.pan.setValueAtTime((idx % 2 === 0 ? -0.35 : 0.35), ctx.currentTime);
        osc.connect(gain);
        gain.connect(pan);
        pan.connect(master);
        this.activeNodes.push(pan);
      } else {
        osc.connect(gain);
        gain.connect(master);
      }

      osc.start();
      this.activeNodes.push(osc, gain);
    });
  }

  /**
   * Synthesizes 1/f Pink Noise for authentic natural masking
   */
  private generatePinkNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBuffer {
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Paul Kellet's filtered pink noise algorithm
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    return buffer;
  }
}

export const ambientSoundscapeService = new AmbientSoundscapeService();
