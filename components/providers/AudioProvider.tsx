"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Howl } from "howler";

export type AudioState = "ambient" | "interactive" | "mute";
export type SoundName = "click" | "hover" | "transition" | "toggle";

const CYCLE_ORDER: AudioState[] = ["ambient", "interactive", "mute"];

interface AudioContextValue {
  audioState: AudioState;
  cycleAudio: () => void;
  playSound: (sound: SoundName) => void;
}

const AudioContext = createContext<AudioContextValue>({
  audioState: "interactive",
  cycleAudio: () => {},
  playSound: () => {},
});

const noop = () => {};

function generateClickSound(ctx: AudioContext): void {
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // node creation failed
  }
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [audioState, setAudioState] = useState<AudioState>("interactive");
  const ambientRef  = useRef<Howl | null>(null);
  const soundsRef   = useRef<Partial<Record<SoundName, Howl>>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    ambientRef.current = new Howl({
      src: ["/audio/ambient.mp3"],
      loop: true,
      volume: 0.15,
      html5: true,
      onloaderror: noop,
      onplayerror: noop,
    });

    const uiSounds: SoundName[] = ["hover", "transition", "toggle"];
    uiSounds.forEach((name) => {
      soundsRef.current[name] = new Howl({
        src: [`/audio/${name}.mp3`],
        volume: 1,
        onloaderror: noop,
        onplayerror: noop,
      });
    });

    const ambient = ambientRef.current;
    const sounds  = soundsRef.current;
    return () => {
      ambient?.unload();
      Object.values(sounds).forEach((s) => s?.unload());
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const ambient = ambientRef.current;
    if (!ambient) return;
    if (audioState === "ambient") {
      if (!ambient.playing()) ambient.play();
    } else {
      ambient.stop();
    }
  }, [audioState]);

  const cycleAudio = useCallback(() => {
    setAudioState((prev) => {
      const idx = CYCLE_ORDER.indexOf(prev);
      return CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
    });
  }, []);

  const playSound = useCallback(
    (sound: SoundName) => {
      if (audioState === "mute") return;

      if (sound === "click") {
        try {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new window.AudioContext();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === "suspended") {
            ctx.resume().then(() => generateClickSound(ctx));
          } else {
            generateClickSound(ctx);
          }
        } catch {
          // AudioContext unavailable
        }
      } else {
        soundsRef.current[sound]?.play();
      }
    },
    [audioState]
  );

  return (
    <AudioContext.Provider value={{ audioState, cycleAudio, playSound }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  return useContext(AudioContext);
}
