// Singleton Web Audio API Synthesizer for Realistic Laboratory Sound Effects

let sharedAudioCtx: AudioContext | null = null;
let globalSoundEnabled: boolean = true;

export function setGlobalSoundEnabled(enabled: boolean): void {
  globalSoundEnabled = enabled;
}

export function isGlobalSoundEnabled(): boolean {
  return globalSoundEnabled;
}

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export type LabSoundType =
  | 'pour'
  | 'drop'
  | 'solid'
  | 'ice'
  | 'fizz'
  | 'sizzle'
  | 'explosion'
  | 'potassium_explosion'
  | 'magnesium_flare'
  | 'hydrogen_pop'
  | 'catalytic_eruption'
  | 'spark'
  | 'burner_on'
  | 'stir'
  | 'precipitate'
  | 'click'
  | 'geiger'
  | 'nucleon'
  | 'success'
  | 'crystallize'
  | 'inflate';

export function playLabSound(type: LabSoundType, muted: boolean = false): void {
  if (muted || !globalSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (type === 'drop') {
      // Single realistic water droplet plop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.09);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'pour') {
      // Multi-droplet liquid pouring stream + splash
      const freqs = [380, 520, 660];
      freqs.forEach((f, idx) => {
        const start = now + idx * 0.055;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);
        osc.frequency.exponentialRampToValueAtTime(f * 1.85, start + 0.08);
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.005, start + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.1);
      });

      // Gentle water splash noise
      const bufSize = Math.floor(ctx.sampleRate * 0.22);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.Q.setValueAtTime(2.5, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.18, now);
      nGain.gain.exponentialRampToValueAtTime(0.005, now + 0.22);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);
    } else if (type === 'solid') {
      // Granular powder / crystal clink into beaker
      for (let i = 0; i < 4; i++) {
        const start = now + i * 0.035;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900 + Math.random() * 600, start);
        osc.frequency.exponentialRampToValueAtTime(400, start + 0.05);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.005, start + 0.055);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.06);
      }
    } else if (type === 'ice') {
      // Crisp ice cubes clinking against glass + splash
      [1450, 1920, 1620].forEach((freq, idx) => {
        const start = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.75, start + 0.07);
        gain.gain.setValueAtTime(0.24, start);
        gain.gain.exponentialRampToValueAtTime(0.005, start + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.085);
      });
    } else if (type === 'fizz') {
      // Realistic effervescence / gas bubbling fizz
      const duration = 0.75;
      const bufSize = Math.floor(ctx.sampleRate * duration);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const env = Math.sin((i / bufSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.linearRampToValueAtTime(2800, now + duration);
      filter.Q.setValueAtTime(1.8, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

      // Micro bubble pops
      for (let b = 0; b < 6; b++) {
        const start = now + b * 0.09 + Math.random() * 0.04;
        const osc = ctx.createOscillator();
        const bGain = ctx.createGain();
        osc.type = 'sine';
        const baseF = 550 + Math.random() * 450;
        osc.frequency.setValueAtTime(baseF, start);
        osc.frequency.exponentialRampToValueAtTime(baseF * 1.9, start + 0.045);
        bGain.gain.setValueAtTime(0.14, start);
        bGain.gain.exponentialRampToValueAtTime(0.005, start + 0.05);
        osc.connect(bGain);
        bGain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.055);
      }
    } else if (type === 'sizzle') {
      // Vigorous alkali metal skittering & sizzling on water surface
      const duration = 0.85;
      const bufSize = Math.floor(ctx.sampleRate * duration);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const mod = 0.6 + 0.4 * Math.sin(i * 0.015);
        data[i] = (Math.random() * 2 - 1) * mod * Math.exp(-i / (ctx.sampleRate * 0.55));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1500, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } else if (type === 'explosion' || type === 'potassium_explosion') {
      // Multi-layered violent chemical detonation (sub-bass shockwave + noise blast + crackle)
      const isPotassium = type === 'potassium_explosion';
      const duration = isPotassium ? 0.85 : 0.7;

      // 1. Sub-bass shockwave boom
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(isPotassium ? 160 : 130, now);
      subOsc.frequency.exponentialRampToValueAtTime(24, now + duration);
      subGain.gain.setValueAtTime(0.75, now);
      subGain.gain.exponentialRampToValueAtTime(0.008, now + duration);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + duration);

      // 2. Explosive broadband blast wave
      const bufSize = Math.floor(ctx.sampleRate * duration);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * (isPotassium ? 0.18 : 0.14)));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isPotassium ? 1600 : 1100, now);
      filter.frequency.exponentialRampToValueAtTime(65, now + duration);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.7, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);

      // 3. Sharp detonation crack / secondary pops for Potassium
      const crackCount = isPotassium ? 4 : 2;
      for (let c = 0; c < crackCount; c++) {
        const start = now + c * 0.08;
        const crackOsc = ctx.createOscillator();
        const crackGain = ctx.createGain();
        crackOsc.type = 'sawtooth';
        crackOsc.frequency.setValueAtTime(520 - c * 80, start);
        crackOsc.frequency.exponentialRampToValueAtTime(45, start + 0.12);
        crackGain.gain.setValueAtTime(0.35, start);
        crackGain.gain.exponentialRampToValueAtTime(0.008, start + 0.12);
        crackOsc.connect(crackGain);
        crackGain.connect(ctx.destination);
        crackOsc.start(start);
        crackOsc.stop(start + 0.13);
      }
    } else if (type === 'magnesium_flare') {
      // Intense blinding white magnesium flare (fireworks sizzle + bright harmonic shimmer)
      const duration = 0.85;
      const bufSize = Math.floor(ctx.sampleRate * duration);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + duration);
      filter.Q.setValueAtTime(1.2, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.48, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);

      // Radiant flare chord
      [880, 1320, 1760].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.55);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.56);
      });
    } else if (type === 'hydrogen_pop') {
      // Authentic Hydrogen "Squeaky Pop Test" (فرقعة الهيدروجين)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.25);
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.008, now + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.27);

      // Pop noise transient
      const bufSize = Math.floor(ctx.sampleRate * 0.2);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.5, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      noise.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now);
    } else if (type === 'catalytic_eruption') {
      // Volcanic oxygen foam eruption whoosh
      const duration = 0.9;
      const bufSize = Math.floor(ctx.sampleRate * duration);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const env = Math.sin((i / bufSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.exponentialRampToValueAtTime(1100, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(280, now + duration);
      filter.Q.setValueAtTime(1.5, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } else if (type === 'spark') {
      // High-voltage electric spark zap & crackle
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1750, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.14);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.008, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(2400, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      gain2.gain.setValueAtTime(0.2, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.13);
    } else if (type === 'burner_on') {
      // Bunsen burner gas ignition whoosh
      const duration = 0.45;
      const bufSize = Math.floor(ctx.sampleRate * duration);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.16));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + duration);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } else if (type === 'stir') {
      // Glass stirring rod swirling in water + gentle glass clinks
      [0, 0.22, 0.45, 0.68].forEach((offset, idx) => {
        const start = now + offset;
        // Glass clink
        const clink = ctx.createOscillator();
        const cGain = ctx.createGain();
        clink.type = 'sine';
        clink.frequency.setValueAtTime(idx % 2 === 0 ? 1680 : 1840, start);
        clink.frequency.exponentialRampToValueAtTime(1420, start + 0.06);
        cGain.gain.setValueAtTime(0.14, start);
        cGain.gain.exponentialRampToValueAtTime(0.004, start + 0.065);
        clink.connect(cGain);
        cGain.connect(ctx.destination);
        clink.start(start);
        clink.stop(start + 0.07);

        // Liquid swirl
        const swirl = ctx.createOscillator();
        const sGain = ctx.createGain();
        swirl.type = 'sine';
        swirl.frequency.setValueAtTime(320 + idx * 40, start + 0.03);
        swirl.frequency.exponentialRampToValueAtTime(580, start + 0.14);
        sGain.gain.setValueAtTime(0.12, start + 0.03);
        sGain.gain.exponentialRampToValueAtTime(0.004, start + 0.15);
        swirl.connect(sGain);
        sGain.connect(ctx.destination);
        swirl.start(start + 0.03);
        swirl.stop(start + 0.16);
      });
    } else if (type === 'precipitate') {
      // Crystalline precipitate formation chime
      [587.33, 880, 1174.66].forEach((f, idx) => {
        const start = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);
        gain.gain.setValueAtTime(0.16, start);
        gain.gain.exponentialRampToValueAtTime(0.005, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } else if (type === 'click') {
      // Clean digital instrument beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1120, now + 0.045);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } else if (type === 'geiger') {
      // Authentic Geiger-Müller counter click burst (3-5 rapid crisp ticks)
      const clicks = [0, 0.025, 0.065, 0.12];
      clicks.forEach((offset, idx) => {
        const start = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1850 - idx * 140, start);
        osc.frequency.exponentialRampToValueAtTime(320, start + 0.014);
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.005, start + 0.016);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.018);
      });
    } else if (type === 'nucleon') {
      // Soft quantum subatomic particle snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.06);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.075);
    } else if (type === 'success') {
      // Ascending harmonic chord for scientific milestone / mission completion
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        const start = now + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.004, start + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.34);
      });
    } else if (type === 'crystallize') {
      // Shimmering crystalline lattice formation chime
      [1046.5, 1318.5, 1567.98, 2093.0, 2637.0].forEach((f, idx) => {
        const start = now + idx * 0.055;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);
        osc.frequency.exponentialRampToValueAtTime(f * 1.03, start + 0.25);
        gain.gain.setValueAtTime(0.16, start);
        gain.gain.exponentialRampToValueAtTime(0.003, start + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.30);
      });
    } else if (type === 'inflate') {
      // Rubber balloon stretching + gas expansion whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.32);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    }
  } catch {
    // Ignore audio context errors on restricted devices
  }
}
