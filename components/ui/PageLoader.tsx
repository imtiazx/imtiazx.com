"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";

const NAME = "imtiaz";
const TYPE_BASE_MS = 70;
const TYPE_JITTER_MS = 50;
const START_DELAY_MS = 300;
const X_DELAY_MS = 120;
const REDUCED_AUTO_DISMISS_MS = 1500;
const DISMISS_UNMOUNT_MS = 950;
const SAFETY_AUTO_DISMISS_MS = 12000;

const THEME_CYCLE: Theme[] = ["light", "dark", "system"];

interface Ripple {
  id: number;
  x: number;
  y: number;
  delay: number;
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "dark") return <Moon size={14} />;
  if (theme === "system") return <Monitor size={14} />;
  return <Sun size={14} />;
}

export function PageLoader() {
  const { theme, setTheme } = useTheme();
  const { audioState } = useAudio();

  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [typedCount, setTypedCount] = useState(0);
  const [showX, setShowX] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const audioStateRef = useRef(audioState);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const reducedRef = useRef(false);
  const dismissedRef = useRef(false);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    audioStateRef.current = audioState;
  }, [audioState]);

  const ensureAudio = useCallback((): AudioContext | null => {
    if (audioCtxRef.current) return audioCtxRef.current;
    if (typeof window === "undefined") return null;
    try {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtxRef.current = new Ctor();
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const canPlayAudio = useCallback((): boolean => {
    if (reducedRef.current) return false;
    if (audioStateRef.current === "mute") return false;
    return true;
  }, []);

  const playClickSound = useCallback(() => {
    if (!canPlayAudio()) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    try {
      const now = ctx.currentTime;

      // Layer 1: noise transient. White noise shaped with exponential decay
      // (time constant 0.007s), gain 0.28, duration 25ms.
      const bufSize = Math.max(1, Math.floor(ctx.sampleRate * 0.025));
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const tt = i / ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-tt / 0.007);
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, now);
      noiseSrc.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSrc.start(now);
      noiseSrc.stop(now + 0.03);

      // Layer 2: tonal body. Sine 1400Hz, peak 0.15, exp decay to 0.001 at +0.10s.
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, now);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // ignore
    }
  }, [canPlayAudio, ensureAudio]);

  const beginDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setExiting(true);
    window.setTimeout(() => {
      setVisible(false);
    }, DISMISS_UNMOUNT_MS);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const restoreOverflow = () => {
      document.body.style.overflow = previousOverflow;
    };

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Safety net: never let the loader hold the body scroll lock indefinitely.
    timeouts.push(setTimeout(() => beginDismiss(), SAFETY_AUTO_DISMISS_MS));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") beginDismiss();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pagehide", restoreOverflow);

    if (reducedRef.current) {
      setTypedCount(NAME.length);
      setShowX(true);
      setShowCursor(true);
      timeouts.push(setTimeout(beginDismiss, REDUCED_AUTO_DISMISS_MS));
    } else {
      let cursor = 0;
      const step = () => {
        if (dismissedRef.current) return;
        cursor += 1;
        setTypedCount(cursor);
        if (cursor < NAME.length) {
          timeouts.push(
            setTimeout(step, TYPE_BASE_MS + Math.random() * TYPE_JITTER_MS),
          );
        } else {
          timeouts.push(
            setTimeout(() => {
              if (dismissedRef.current) return;
              setShowX(true);
              setShowCursor(true);
            }, X_DELAY_MS),
          );
        }
      };
      timeouts.push(setTimeout(step, START_DELAY_MS));
    }

    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pagehide", restoreOverflow);
      restoreOverflow();
    };
  }, [beginDismiss]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dismissedRef.current) return;
    const x = e.clientX;
    const y = e.clientY;

    playClickSound();

    const burst: Ripple[] = [0, 120, 240].map((delay) => ({
      id: rippleIdRef.current++,
      x,
      y,
      delay,
    }));
    setRipples((prev) => [...prev, ...burst]);

    beginDismiss();
  };

  const handleThemeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "var(--color-bg)",
        overflow: "hidden",
        cursor: dismissedRef.current ? "default" : "pointer",
      }}
    >
      <div
        className="loader-fade"
        style={{
          position: "absolute",
          inset: 0,
          opacity: exiting ? 0 : 1,
          transition: "opacity 600ms ease 300ms",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            pointerEvents: "none",
          }}
        >
          <div className="loader-seal" aria-hidden>
            <div className="loader-seal-inner">
              <svg viewBox="0 0 44 44" width="44" height="44" fill="none" aria-hidden>
                <polyline
                  points="14,12 28,20 14,28"
                  stroke="var(--color-brand)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="14"
                  y1="34"
                  x2="32"
                  y2="34"
                  stroke="var(--color-brand)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono), ui-monospace, Menlo, monospace",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.04em",
              lineHeight: 1.2,
              color: "var(--color-text-primary)",
              display: "inline-flex",
              alignItems: "baseline",
              minHeight: "1.4em",
            }}
          >
            <span style={{ whiteSpace: "pre", fontWeight: 700 }}>{NAME.slice(0, typedCount)}</span>
            {showX && <span style={{ color: "var(--color-brand)", fontWeight: 700 }}>x</span>}
            {showCursor && (
              <span
                aria-hidden
                className="loader-cursor"
                style={{
                  color: "var(--color-brand)",
                  marginLeft: "0.05em",
                  fontWeight: 700,
                }}
              >
                |
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleThemeToggle}
        aria-label={`Switch theme (current: ${theme})`}
        className="loader-theme-toggle"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          color: "var(--color-brand)",
          background: "transparent",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "color-mix(in srgb, var(--color-brand) 28%, transparent)",
          cursor: "pointer",
          zIndex: 10001,
          opacity: exiting ? 0 : 1,
          transition: "opacity 300ms ease, background-color 200ms ease",
        }}
      >
        <ThemeIcon theme={theme} />
      </button>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10000,
        }}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="loader-ripple"
            style={{
              left: r.x,
              top: r.y,
              animationDelay: `${r.delay}ms`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .loader-seal {
          position: relative;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 1.5px solid color-mix(in srgb, var(--color-brand) 35%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: loaderSealPulse 3s ease-in-out infinite;
        }
        .loader-seal-inner {
          width: 94px;
          height: 94px;
          border-radius: 50%;
          background-color: color-mix(in srgb, var(--color-bg) 92%, transparent);
          border: 0.5px solid color-mix(in srgb, var(--color-brand) 18%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loader-cursor {
          animation: loaderCursorBlink 1s step-end infinite;
        }
        .loader-theme-toggle:hover {
          background-color: color-mix(in srgb, var(--color-brand) 12%, transparent);
        }
        .loader-ripple {
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          border-width: 2px;
          border-style: solid;
          border-color: color-mix(in srgb, var(--color-brand) 55%, transparent);
          opacity: 0.7;
          transform: translate(-50%, -50%);
          animation: loaderRippleExpand 700ms ease-out forwards;
          pointer-events: none;
        }
        @keyframes loaderSealPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-brand) 0%, transparent);
            border-color: color-mix(in srgb, var(--color-brand) 35%, transparent);
          }
          50% {
            box-shadow: 0 0 24px 6px color-mix(in srgb, var(--color-brand) 32%, transparent);
            border-color: color-mix(in srgb, var(--color-brand) 75%, transparent);
          }
        }
        @keyframes loaderCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes loaderRippleExpand {
          from {
            width: 0;
            height: 0;
            opacity: 0.7;
          }
          to {
            width: 220vmax;
            height: 220vmax;
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .loader-seal,
          .loader-cursor,
          .loader-ripple {
            animation: none !important;
          }
          .loader-ripple {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
