"use client";

import { useEffect, useState } from "react";

const GREETINGS = [
  "Hello",
  "こんにちは",
  "Bonjour",
  "Hallo",
  "你好",
  "Hej",
  "Ciao",
  "안녕하세요",
  "Olá",
  "হ্যালো",
];

const WORD_IN = 280;
const WORD_HOLD = 380;
const WORD_OUT = 180;
const WORD_GAP = 60;

const NAME_PAUSE = 400;
const NAME_IN = 500;
const NAME_HOLD_SOLO = 700;
const X_IN = 300;
const X_GLOW = 800;
const NAME_HOLD_FULL = 1000;
const FADE_OUT = 400;

const REDUCED_HOLD = 300;

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [currentGreeting, setCurrentGreeting] = useState(-1);
  const [showName, setShowName] = useState(false);
  const [showX, setShowX] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (delay: number, fn: () => void) => {
      timers.push(setTimeout(fn, delay));
    };

    document.body.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setShowName(true);
      setShowX(true);
      schedule(REDUCED_HOLD, () => setExiting(true));
      schedule(REDUCED_HOLD + FADE_OUT, () => {
        setVisible(false);
        document.body.style.overflow = "";
      });
      return () => {
        timers.forEach(clearTimeout);
        document.body.style.overflow = "";
      };
    }

    let t = 0;
    GREETINGS.forEach((_, i) => {
      const start = t;
      schedule(start, () => setCurrentGreeting(i));
      schedule(start + WORD_IN + WORD_HOLD, () => {
        setCurrentGreeting((prev) => (prev === i ? -1 : prev));
      });
      t += WORD_IN + WORD_HOLD + WORD_OUT + WORD_GAP;
    });

    const namePhaseStart = t + NAME_PAUSE;
    schedule(namePhaseStart, () => setShowName(true));

    const xPhaseStart = namePhaseStart + NAME_IN + NAME_HOLD_SOLO;
    schedule(xPhaseStart, () => {
      setShowX(true);
      setShowGlow(true);
    });
    schedule(xPhaseStart + X_GLOW, () => setShowGlow(false));

    const fadeStart = xPhaseStart + X_IN + X_GLOW + NAME_HOLD_FULL;
    schedule(fadeStart, () => setExiting(true));
    schedule(fadeStart + FADE_OUT, () => {
      setVisible(false);
      document.body.style.overflow = "";
    });

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#FAFAF9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: exiting ? 0 : 1,
        transition: `opacity ${FADE_OUT}ms ease-in`,
      }}
    >
      {!showName && (
        <div
          style={{
            position: "relative",
            width: "min(90vw, 800px)",
            height: "1em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            color: "#1C1917",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {GREETINGS.map((word, i) => {
            const isActive = currentGreeting === i;
            return (
              <span
                key={word}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: isActive
                    ? "translate(-50%, -50%) scale(1)"
                    : currentGreeting > i
                      ? "translate(-50%, -50%) scale(1.08)"
                      : "translate(-50%, -50%) scale(0.82)",
                  opacity: isActive ? 1 : 0,
                  transition: isActive
                    ? `opacity ${WORD_IN}ms ease-out, transform ${WORD_IN}ms ease-out`
                    : `opacity ${WORD_OUT}ms ease-in, transform ${WORD_OUT}ms ease-in`,
                  whiteSpace: "nowrap",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      )}

      {showName && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 0,
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            color: "#1C1917",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontWeight: 300,
              fontStyle: "italic",
              opacity: 1,
              transform: "translateY(0)",
              transition: `opacity ${NAME_IN}ms ease-out, transform ${NAME_IN}ms ease-out`,
              animation: `loaderNameIn ${NAME_IN}ms ease-out both`,
            }}
          >
            imtiaz
          </span>
          {showX && (
            <span
              style={{
                fontWeight: 300,
                fontStyle: "italic",
                color: "#EA580C",
                display: "inline-block",
                animation: `loaderXIn ${X_IN}ms ease-out both${
                  showGlow ? `, loaderXGlow ${X_GLOW}ms ease-in-out both` : ""
                }`,
              }}
            >
              x
            </span>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes loaderNameIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes loaderXIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes loaderXGlow {
          0% {
            text-shadow: 0 0 0px rgba(234, 88, 12, 0);
          }
          50% {
            text-shadow: 0 0 20px rgba(234, 88, 12, 0.6);
          }
          100% {
            text-shadow: 0 0 0px rgba(234, 88, 12, 0);
          }
        }
      `}</style>
    </div>
  );
}
