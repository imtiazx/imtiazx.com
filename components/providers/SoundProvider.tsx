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

export type SoundMode = "muted" | "click" | "full";

const CYCLE: SoundMode[] = ["muted", "click", "full"];
const STORAGE_KEY = "sound-mode";
const DEFAULT_MODE: SoundMode = "click";

// Low volumes by design. Music sits under everything as a vibe layer; the
// click is a soft tactile blip, never a punch.
const MUSIC_VOLUME = 0.1;
const CLICK_VOLUME = 0.18;
const MUSIC_FADE_MS = 600;

const MUSIC_SRC = "/audio/ambient.mp3";
const CLICK_SRC = "/audio/click.wav";

interface SoundContextValue {
  mode: SoundMode;
  cycleMode: () => void;
}

const SoundContext = createContext<SoundContextValue>({
  mode: DEFAULT_MODE,
  cycleMode: () => {},
});

function fadeTo(audio: HTMLAudioElement, target: number, ms: number) {
  const start = audio.volume;
  const startTs = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - startTs) / ms);
    audio.volume = start + (target - start) * t;
    if (t < 1) requestAnimationFrame(step);
    else if (target === 0) audio.pause();
  };
  requestAnimationFrame(step);
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SoundMode>(DEFAULT_MODE);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  // The very first `setMode` from localStorage shouldn't try to start music
  // before the user has interacted with the page; browsers will block it.
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SoundMode | null;
      if (stored && CYCLE.includes(stored)) setMode(stored);
    } catch {}
    hydratedRef.current = true;
  }, []);

  // Create the audio elements once. Music loops; click is a one-shot we
  // restart by resetting currentTime, which is plenty for the cadence here.
  useEffect(() => {
    const music = new Audio(MUSIC_SRC);
    music.loop = true;
    music.preload = "auto";
    music.volume = 0;
    musicRef.current = music;

    const click = new Audio(CLICK_SRC);
    click.preload = "auto";
    click.volume = CLICK_VOLUME;
    clickRef.current = click;

    return () => {
      music.pause();
      musicRef.current = null;
      clickRef.current = null;
    };
  }, []);

  // React to mode changes for the background music. If autoplay is blocked
  // (returning visitor whose stored mode is "full" but who hasn't clicked
  // yet), arm a one-shot listener that retries on the first real gesture.
  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    let cancelled = false;
    let retryOff: (() => void) | undefined;

    const start = () => {
      music.volume = 0;
      music
        .play()
        .then(() => {
          if (!cancelled) fadeTo(music, MUSIC_VOLUME, MUSIC_FADE_MS);
        })
        .catch(() => {
          if (cancelled) return;
          const retry = () => {
            retryOff?.();
            if (!cancelled) start();
          };
          window.addEventListener("pointerdown", retry, { once: true });
          window.addEventListener("keydown", retry, { once: true });
          retryOff = () => {
            window.removeEventListener("pointerdown", retry);
            window.removeEventListener("keydown", retry);
          };
        });
    };

    if (mode === "full") {
      start();
    } else if (!music.paused) {
      fadeTo(music, 0, MUSIC_FADE_MS);
    }

    return () => {
      cancelled = true;
      retryOff?.();
    };
  }, [mode]);

  // Global click feedback. Plays on primary mouse button only, skips inputs
  // and textareas so typing doesn't tick.
  useEffect(() => {
    if (mode === "muted") return;
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      if (target && typeof target.closest === "function") {
        if (target.closest("input, textarea, select, [contenteditable='true']"))
          return;
      }
      const click = clickRef.current;
      if (!click) return;
      try {
        click.currentTime = 0;
        click.volume = CLICK_VOLUME;
        void click.play();
      } catch {}
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [mode]);

  const cycleMode = useCallback(() => {
    setMode((prev) => {
      const idx = CYCLE.indexOf(prev);
      const next = CYCLE[(idx + 1) % CYCLE.length];
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider value={{ mode, cycleMode }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  return useContext(SoundContext);
}
