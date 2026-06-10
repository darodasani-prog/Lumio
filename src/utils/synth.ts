/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: Record<string, {
    mainVolume: GainNode;
    sources: AudioNode[];
    timers: number[];
  }> = {};

  // Initialize AudioContext lazily on user gesture
  private init(): boolean {
    if (this.ctx) return true;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      return true;
    } catch (e) {
      console.error('Failed to initialize Web Audio API Context', e);
      return false;
    }
  }

  // Create a reusable white-noise buffer for rainfall, fire base, etc.
  private getNoiseBuffer(durationSeconds = 2.0): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public togglePlayState(id: string, play: boolean, volume = 0.5) {
    if (!play) {
      this.stopChannel(id);
      return;
    }

    if (!this.init()) return;
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    // If already playing, just update volume
    if (this.activeNodes[id]) {
      this.setChannelVolume(id, volume);
      return;
    }

    const ctx = this.ctx!;
    const channelVolumeScale = ctx.createGain();
    channelVolumeScale.gain.setValueAtTime(volume, ctx.currentTime);
    channelVolumeScale.connect(this.masterGain!);

    const sources: AudioNode[] = [];
    const timers: number[] = [];

    // Construct the synthesis network depending on ID
    if (id === 'rain') {
      // Procedural storm + rain
      const noiseBuffer = this.getNoiseBuffer(3.0);
      if (noiseBuffer) {
        // Main fall noise
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        // Base lowpass cut-off
        lowpass.frequency.setValueAtTime(500, ctx.currentTime);

        // Wind/Storm sweeping modulation
        const sweepOsc = ctx.createOscillator();
        sweepOsc.type = 'sine';
        sweepOsc.frequency.setValueAtTime(0.06, ctx.currentTime); // very slow cycle

        const sweepGain = ctx.createGain();
        sweepGain.gain.setValueAtTime(250, ctx.currentTime); // Sweep depth +/- 250Hz

        sweepOsc.connect(sweepGain);
        sweepGain.connect(lowpass.frequency); // Modulate cut-off
        sweepOsc.start();

        src.connect(lowpass);
        lowpass.connect(channelVolumeScale);
        src.start();

        sources.push(src, lowpass, sweepOsc);
      }
    } 
    else if (id === 'binaural') {
      // Theta deep focus beats (140Hz and 146Hz) for binaural effect
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(140, ctx.currentTime);

      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(146, ctx.currentTime);

      // Stereo separation for binaural synthesis
      const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, ctx.currentTime); // Low deep drone

      if (pannerL && pannerR) {
        pannerL.pan.setValueAtTime(-1, ctx.currentTime);
        pannerR.pan.setValueAtTime(1, ctx.currentTime);

        oscL.connect(pannerL);
        oscR.connect(pannerR);

        pannerL.connect(filter);
        pannerR.connect(filter);
        sources.push(oscL, oscR, pannerL, pannerR, filter);
      } else {
        oscL.connect(filter);
        oscR.connect(filter);
        sources.push(oscL, oscR, filter);
      }

      filter.connect(channelVolumeScale);

      oscL.start();
      oscR.start();
    } 
    else if (id === 'fire') {
      // Campfire rumble + crackles
      const noiseBuffer = this.getNoiseBuffer(2.0);
      if (noiseBuffer) {
        // Fire Base rumble
        const baseSrc = ctx.createBufferSource();
        baseSrc.buffer = noiseBuffer;
        baseSrc.loop = true;

        const rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.setValueAtTime(85, ctx.currentTime);

        baseSrc.connect(rumbleFilter);
        rumbleFilter.connect(channelVolumeScale);
        baseSrc.start();

        sources.push(baseSrc, rumbleFilter);

        // Crackling pop triggers
        const triggerCrackle = () => {
          if (!this.activeNodes[id]) return;
          try {
            // Synthesize single crackle pop
            const popOsc = ctx.createOscillator();
            popOsc.type = 'triangle';
            popOsc.frequency.setValueAtTime(400 + Math.random() * 800, ctx.currentTime);

            const popFilter = ctx.createBiquadFilter();
            popFilter.type = 'bandpass';
            popFilter.frequency.setValueAtTime(1800 + Math.random() * 600, ctx.currentTime);
            popFilter.Q.setValueAtTime(8, ctx.currentTime);

            const popGain = ctx.createGain();
            // Fast envelope decay
            const now = ctx.currentTime;
            popGain.gain.setValueAtTime(0, now);
            popGain.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.08, now + 0.001);
            popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012 + Math.random() * 0.01);

            popOsc.connect(popFilter);
            popFilter.connect(popGain);
            popGain.connect(channelVolumeScale);

            popOsc.start(now);
            popOsc.stop(now + 0.1);

            // Trigger next crackle at random interval
            const nextTimeout = setTimeout(triggerCrackle, 120 + Math.random() * 320);
            timers.push(Number(nextTimeout));
          } catch (e) {
            // Safe handle
          }
        };

        triggerCrackle();
      }
    } 
    else if (id === 'galaxy') {
      // Celestial slow breathing pads (root, minor, ambient chords)
      // Play a beautiful, evolving Fmaj7 / Am progression slowly
      const notes = [
        [130.81, 164.81, 196.00, 246.94], // C3, E3, G3, B3 (Cmaj7)
        [110.00, 164.81, 196.00, 220.00], // A2, E3, G3, A3 (Am7)
        [146.83, 174.61, 220.00, 261.63]  // D3, F3, A3, C4 (Dm7)
      ];

      const oscs: OscillatorNode[] = [];
      const filters: BiquadFilterNode[] = [];
      const gains: GainNode[] = [];

      // Create 4 voice synthesis pad
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine'; // warm wave

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);

        const filterNode = ctx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(290, ctx.currentTime);

        // Add slow LFO to breathe the pads
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.05 + i * 0.015, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(120, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filterNode.frequency);
        lfo.start();

        osc.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(channelVolumeScale);

        osc.start();

        oscs.push(osc, lfo);
        filters.push(filterNode);
        gains.push(gainNode);
        sources.push(osc, lfo, filterNode, gainNode);
      }

      // Evolve chord notes cyclically
      let chordIndex = 0;
      const cycleChords = () => {
        if (!this.activeNodes[id]) return;
        const now = ctx.currentTime;
        const currentChord = notes[chordIndex];

        for (let i = 0; i < 4; i++) {
          const oscIndex = i * 2; // Osc and LFO are interleaved
          const oscillator = oscs[oscIndex];
          if (oscillator) {
            // Portamento transition
            oscillator.frequency.exponentialRampToValueAtTime(currentChord[i], now + 2.5);
          }
        }

        chordIndex = (chordIndex + 1) % notes.length;
        const nextTimeout = setTimeout(cycleChords, 6000);
        timers.push(Number(nextTimeout));
      };

      cycleChords();
    }
    else if (id === 'espresso') {
      // Cozy Cafe hubbub
      // Distant warm crowd drone + cup clickers
      const noiseBuffer = this.getNoiseBuffer(2.5);
      if (noiseBuffer) {
        const cafeMumble = ctx.createBufferSource();
        cafeMumble.buffer = noiseBuffer;
        cafeMumble.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(140, ctx.currentTime); // very low crowd rumble

        cafeMumble.connect(lowpass);
        lowpass.connect(channelVolumeScale);
        cafeMumble.start();

        sources.push(cafeMumble, lowpass);

        const triggerCups = () => {
          if (!this.activeNodes[id]) return;
          try {
            // Tap sound
            const tapOsc = ctx.createOscillator();
            tapOsc.type = 'sine';
            tapOsc.frequency.setValueAtTime(1800 + Math.random() * 1200, ctx.currentTime);

            const tapGain = ctx.createGain();
            const now = ctx.currentTime;
            tapGain.gain.setValueAtTime(0, now);
            tapGain.gain.linearRampToValueAtTime(0.04, now + 0.002);
            tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03 + Math.random() * 0.04);

            tapOsc.connect(tapGain);
            tapGain.connect(channelVolumeScale);

            tapOsc.start(now);
            tapOsc.stop(now + 0.1);

            const nextTimeout = setTimeout(triggerCups, 2500 + Math.random() * 4000);
            timers.push(Number(nextTimeout));
          } catch (e) {}
        };

        triggerCups();
      }
    }

    this.activeNodes[id] = {
      mainVolume: channelVolumeScale,
      sources,
      timers
    };
  }

  public setChannelVolume(id: string, volume: number) {
    if (this.activeNodes[id]) {
      const now = this.ctx?.currentTime || 0;
      this.activeNodes[id].mainVolume.gain.linearRampToValueAtTime(volume, now + 0.1);
    }
  }

  public stopChannel(id: string) {
    if (this.activeNodes[id]) {
      const node = this.activeNodes[id];
      // Cancel timers
      node.timers.forEach(timer => clearTimeout(timer));
      // Stop oscillators/sources
      node.sources.forEach(src => {
        try {
          if ('stop' in src) {
            (src as any).stop();
          }
        } catch (e) {
          // already stopped or unsupported
        }
        try {
          src.disconnect();
        } catch (e) {}
      });
      delete this.activeNodes[id];
    }
  }

  public stopAll() {
    Object.keys(this.activeNodes).forEach(id => this.stopChannel(id));
  }
}

export const synth = new SynthEngine();
