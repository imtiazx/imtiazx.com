"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon, Monitor } from "lucide-react";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { playUnlock } from "@/lib/sound";

const NAME = "imtiaz";
const TYPE_BASE_MS = 70;
const TYPE_JITTER_MS = 50;
const START_DELAY_MS = 300;
const X_DELAY_MS = 80;
// Hold the finished "imtiazx" only briefly, then dismiss on its own. Kept short
// so the handoff to the page underneath feels instant, not laggy.
const AUTO_DISMISS_HOLD_MS = 80;
const REDUCED_AUTO_DISMISS_MS = 80;
// Unmount right as the 200ms fade completes, so the transparent overlay does not
// linger over (or keep capturing clicks on) the already-revealed page.
const DISMISS_UNMOUNT_MS = 200;
const SAFETY_AUTO_DISMISS_MS = 12000;

const THEME_CYCLE: Theme[] = ["system", "light", "dark"];

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

  // When the document first loads on the intro gateway ("/"), that scene owns
  // the reveal, so the standalone loader stays out of the way for the whole
  // session. Direct hard-loads of other routes still get the loader.
  const pathname = usePathname();
  const skipRef = useRef(pathname === "/");

  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [typedCount, setTypedCount] = useState(0);
  const [showX, setShowX] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const audioStateRef = useRef(audioState);
  const reducedRef = useRef(false);
  const dismissedRef = useRef(false);
  const rippleIdRef = useRef(0);
  // The loader returns null when dismissed but never unmounts (it lives in the
  // layout), so the effect cleanup that restores scroll never fires. We restore
  // it explicitly in beginDismiss, reading the value saved by the lock effect.
  const previousOverflowRef = useRef("");

  useEffect(() => {
    audioStateRef.current = audioState;
  }, [audioState]);

  const canPlayAudio = useCallback((): boolean => {
    if (reducedRef.current) return false;
    if (audioStateRef.current === "mute") return false;
    return true;
  }, []);

  // The same soft unlock chime used by the intro gateway.
  const playClickSound = useCallback(() => {
    if (!canPlayAudio()) return;
    playUnlock();
  }, [canPlayAudio]);

  const beginDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setExiting(true);
    // Release the scroll lock immediately; the overlay is fixed-position so it
    // can fade out over freed content without any jump.
    document.body.style.overflow = previousOverflowRef.current;
    window.setTimeout(() => {
      setVisible(false);
    }, DISMISS_UNMOUNT_MS);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (skipRef.current) return;
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const restoreOverflow = () => {
      document.body.style.overflow = previousOverflowRef.current;
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
              // Reveal complete: hold briefly, then dismiss so scroll unlocks
              // without waiting on a click or the safety timeout.
              timeouts.push(setTimeout(beginDismiss, AUTO_DISMISS_HOLD_MS));
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

  if (skipRef.current || !visible) return null;

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
          transition: "opacity 200ms ease",
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
          transition: "opacity 200ms ease, background-color 200ms ease",
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
