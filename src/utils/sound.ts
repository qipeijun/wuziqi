// Simple Web Audio API wrapper for synthesizing game sounds
// No external assets required

class SoundManager {
  private context: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
  }

  public getMute() {
    return this.isMuted;
  }

  // Generic move sound (fallback)
  public playMoveSound() {
    this.playStoneSound('generic');
  }

  // Distinct sounds for Black vs White
  public playStoneSound(type: 'black' | 'white' | 'generic') {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Filter to simulate material resonance
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'black') {
        // Black Stone (Slate/Cloud Stone): Deeper, duller "Thock"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        
        osc.start(t);
        osc.stop(t + 0.15);
      } else {
        // White Stone (Shell/Glass): Higher, sharper "Click/Ti"
        osc.type = 'triangle'; // Brighter waveform
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, t); // Cut mud
        
        gain.gain.setValueAtTime(0.25, t); // Lower volume for high pitch to avoid harshness
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        
        osc.start(t);
        osc.stop(t + 0.1);
      }

    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  public playWinSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      
      // Major chord arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const start = ctx.currentTime;

      notes.forEach((note, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const time = start + i * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 1);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  public playButtonSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // High crisp click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2000, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }
}

export const soundManager = new SoundManager();