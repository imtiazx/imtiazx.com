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
export type SoundName = "click" | "transition" | "toggle";

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

export function AudioProvider({ children }: { children: ReactNode }) {
  const [audioState, setAudioState] = useState<AudioState>("interactive");
  const ambientRef = useRef<Howl | null>(null);

  useEffect(() => {
    ambientRef.current = new Howl({
      src: ["/audio/ambient.mp3"],
      loop: true,
      volume: 0.15,
      html5: true,
      onloaderror: noop,
      onplayerror: noop,
    });

    const ambient = ambientRef.current;
    return () => {
      ambient?.unload();
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

  // UI click / transition / toggle effects are intentionally silent. The only
  // deliberate sound on the site is the unlock chime on the intro gateway
  // (see lib/sound.ts); ambient music still plays when the visitor selects it.
  const playSound = useCallback((_sound: SoundName) => {
    void _sound;
  }, []);

  return (
    <AudioContext.Provider value={{ audioState, cycleAudio, playSound }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  return useContext(AudioContext);
}
