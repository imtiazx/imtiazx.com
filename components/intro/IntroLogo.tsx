"use client";

import { useEffect, useState } from "react";

const NAME = "imtiaz";
const TYPE_BASE_MS = 70;
const TYPE_JITTER_MS = 50;
const START_DELAY_MS = 300;
const X_DELAY_MS = 120;

// The glowing terminal seal from the page loader, reused as the still center of
// the intro gateway. Types "imtiaz" then a brand "x" with a blinking cursor.
export function IntroLogo() {
  const [typedCount, setTypedCount] = useState(0);
  const [showX, setShowX] = useState(false);
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      setTypedCount(NAME.length);
      setShowX(true);
      setShowCursor(true);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let cursor = 0;

    const step = () => {
      cursor += 1;
      setTypedCount(cursor);
      if (cursor < NAME.length) {
        timeouts.push(
          setTimeout(step, TYPE_BASE_MS + Math.random() * TYPE_JITTER_MS),
        );
      } else {
        timeouts.push(
          setTimeout(() => {
            setShowX(true);
            setShowCursor(true);
          }, X_DELAY_MS),
        );
      }
    };

    timeouts.push(setTimeout(step, START_DELAY_MS));
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div
      aria-hidden
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
      <div className="intro-seal">
        <div className="intro-seal-inner">
          <svg
            className="intro-mark"
            viewBox="0 0 44 44"
            width="44"
            height="44"
            fill="none"
            aria-hidden
          >
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
        <span style={{ whiteSpace: "pre", fontWeight: 700 }}>
          {NAME.slice(0, typedCount)}
        </span>
        {showX && (
          <span
            className="intro-x"
            style={{ color: "var(--color-brand)", fontWeight: 700 }}
          >
            x
          </span>
        )}
        {showCursor && (
          <span
            className="intro-cursor"
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

      <style jsx>{`
        .intro-seal {
          position: relative;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 1.5px solid color-mix(in srgb, var(--color-brand) 35%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: introSealPulse 3s ease-in-out infinite;
        }
        .intro-seal-inner {
          width: 94px;
          height: 94px;
          border-radius: 50%;
          background-color: color-mix(in srgb, var(--color-bg) 92%, transparent);
          border: 0.5px solid color-mix(in srgb, var(--color-brand) 18%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .intro-cursor {
          animation: introCursorBlink 1s step-end infinite;
        }
        /* Same 3s rhythm as the seal pulse, applied to the orange mark + x. */
        .intro-mark {
          animation: introMarkGlow 3s ease-in-out infinite;
        }
        .intro-x {
          display: inline-block;
          animation: introXGlow 3s ease-in-out infinite;
        }
        @keyframes introMarkGlow {
          0%,
          100% {
            filter: drop-shadow(
              0 0 1px color-mix(in srgb, var(--color-brand) 30%, transparent)
            );
          }
          50% {
            filter: drop-shadow(
              0 0 7px color-mix(in srgb, var(--color-brand) 80%, transparent)
            );
          }
        }
        @keyframes introXGlow {
          0%,
          100% {
            text-shadow: 0 0 2px
              color-mix(in srgb, var(--color-brand) 25%, transparent);
          }
          50% {
            text-shadow: 0 0 11px
              color-mix(in srgb, var(--color-brand) 70%, transparent);
          }
        }
        @keyframes introSealPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-brand) 0%, transparent);
            border-color: color-mix(in srgb, var(--color-brand) 35%, transparent);
          }
          50% {
            box-shadow: 0 0 24px 6px color-mix(in srgb, var(--color-brand) 32%, transparent);
            border-color: color-mix(in srgb, var(--color-brand) 75%, transparent);
          }
        }
        @keyframes introCursorBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .intro-seal,
          .intro-cursor,
          .intro-mark,
          .intro-x {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
