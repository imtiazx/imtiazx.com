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
    const v = start + (target - start) * t;
    // HTMLMediaElement.volume rejects anything outside [0, 1]; floating-point
    // drift at the tail of a fade (or rapid mode toggles that overlap two
    // fades on the same element) can produce a sliver below 0, throwing
    // IndexSizeError. Clamp defensively.
    audio.volume = v < 0 ? 0 : v > 1 ? 1 : v;
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
  // Synchronous mirror of `mode` so cycleMode can compute the next value
  // without waiting for React to commit. Updated by cycleMode itself before
  // calling setMode so rapid double-clicks chain through the cycle correctly.
  const modeRef = useRef<SoundMode>(DEFAULT_MODE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SoundMode | null;
      if (stored && CYCLE.includes(stored)) {
        setMode(stored);
        modeRef.current = stored;
      }
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
      // cycleMode already kicks playback off inside the user-gesture stack
      // frame (Safari needs that). Only re-attempt here for the initial-mount
      // case: a returning visitor whose stored mode is already "full" but who
      // hasn't clicked yet. start() then arms a retry on the first gesture.
      if (music.paused) start();
    }
    // No fade-out branch here on purpose. cycleMode owns the leaving-"full"
    // transition synchronously; fading from here too would race two RAF loops
    // on the same audio.volume and drift negative.

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
    const prev = modeRef.current;
    const next = CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length];
    modeRef.current = next;

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}

    // Drive the audio synchronously inside the click handler. The mode-watcher
    // effect runs after React commits, which is past the browser's transient
    // user-activation window in Safari, so play() called from there silently
    // fails. Doing it here is what actually unblocks music on the click that
    // toggles into "full".
    const music = musicRef.current;
    if (music) {
      if (next === "full" && music.paused) {
        music.volume = 0;
        music
          .play()
          .then(() => fadeTo(music, MUSIC_VOLUME, MUSIC_FADE_MS))
          .catch(() => {});
      } else if (next !== "full" && !music.paused) {
        fadeTo(music, 0, MUSIC_FADE_MS);
      }
    }

    setMode(next);
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
