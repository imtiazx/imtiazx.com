// The one deliberate sound on the site: a soft, premium "unlock" chime played
// when the visitor clicks through the intro gateway (or the fallback page
// loader). Synthesized via the Web Audio API so it ships no audio asset and
// stays crisp at any sample rate. Every other UI sound is intentionally muted
// (see AudioProvider) so this chime stands on its own.
//
// Shape: a short noise "unlatch" tick layered under two warm sine tones that
// rise a perfect fifth (G4 -> D5), each with a quiet octave shimmer, all run
// through a gentle low-pass so it reads soft rather than sharp. ~0.4s total.

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedCtx) return sharedCtx;
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    sharedCtx = new Ctor();
  } catch {
    return null;
  }
  return sharedCtx;
}

export function playUnlock(): void {
  const ctx = getContext();
  if (!ctx) return;
  // The click that calls this is the user gesture that unlocks audio.
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  try {
    const t0 = ctx.currentTime;

    const out = ctx.createGain();
    out.gain.setValueAtTime(0.9, t0);
    out.connect(ctx.destination);

    // Keep the whole chime soft and rounded.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2600, t0);
    lp.Q.setValueAtTime(0.6, t0);
    lp.connect(out);

    // Layer 1: the "unlatch" -- a brief noise transient with fast decay.
    const tickLen = Math.max(1, Math.floor(ctx.sampleRate * 0.02));
    const tickBuf = ctx.createBuffer(1, tickLen, ctx.sampleRate);
    const tickData = tickBuf.getChannelData(0);
    for (let i = 0; i < tickLen; i++) {
      const tt = i / ctx.sampleRate;
      tickData[i] = (Math.random() * 2 - 1) * Math.exp(-tt / 0.004);
    }
    const tick = ctx.createBufferSource();
    tick.buffer = tickBuf;
    const tickGain = ctx.createGain();
    tickGain.gain.setValueAtTime(0.09, t0);
    tick.connect(tickGain);
    tickGain.connect(lp);
    tick.start(t0);
    tick.stop(t0 + 0.03);

    // Layer 2: two warm tones rising a fifth -- an affirmative "unlocked".
    const tone = (freq: number, start: number, dur: number, peak: number) => {
      const begin = t0 + start;

      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, begin);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, begin);
      g.gain.exponentialRampToValueAtTime(peak, begin + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, begin + dur);
      o.connect(g);
      g.connect(lp);
      o.start(begin);
      o.stop(begin + dur + 0.02);

      // Quiet octave shimmer for a bell-like sheen.
      const o2 = ctx.createOscillator();
      o2.type = "sine";
      o2.frequency.setValueAtTime(freq * 2, begin);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, begin);
      g2.gain.exponentialRampToValueAtTime(peak * 0.22, begin + 0.015);
      g2.gain.exponentialRampToValueAtTime(0.0001, begin + dur * 0.7);
      o2.connect(g2);
      g2.connect(lp);
      o2.start(begin);
      o2.stop(begin + dur);
    };

    tone(392.0, 0.0, 0.22, 0.18); // G4
    tone(587.33, 0.06, 0.34, 0.2); // D5
  } catch {
    // Audio unavailable -- fail silent.
  }
}
