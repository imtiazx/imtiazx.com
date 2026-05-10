"use client";

import { useEffect, useState } from "react";

/* ─── Zone 0: interactive math symbols (side margins only) ───────────────── */

const MATH_SYMBOLS = [
  // Left margin  (x: 1–10%)
  { t: "∑",       x: 3,  y: 12, size: 13, dur: 88  },
  { t: "λ",       x: 7,  y: 28, size: 15, dur: 100 },
  { t: "argmax",  x: 2,  y: 45, size: 11, dur: 80  },
  { t: "∫",       x: 9,  y: 62, size: 14, dur: 95  },
  { t: "E[X]",    x: 4,  y: 78, size: 12, dur: 105 },
  { t: "∂L/∂w",  x: 7,  y: 18, size: 11, dur: 85  },
  { t: "∈",       x: 3,  y: 55, size: 13, dur: 88  },
  { t: "Σwᵢxᵢ",  x: 8,  y: 85, size: 10, dur: 108 },
  { t: "∇²",      x: 5,  y: 38, size: 12, dur: 68  },
  { t: "O(n²)",   x: 2,  y: 70, size: 12, dur: 98  },
  // Right margin (x: 88–98%)
  { t: "σ",       x: 95, y: 15, size: 14, dur: 85  },
  { t: "∞",       x: 90, y: 32, size: 15, dur: 62  },
  { t: "⊕",       x: 97, y: 50, size: 11, dur: 115 },
  { t: "softmax", x: 89, y: 68, size: 10, dur: 92  },
  { t: "P(x|θ)",  x: 93, y: 82, size: 12, dur: 105 },
  { t: "μ",       x: 91, y: 8,  size: 13, dur: 110 },
  { t: "∂",       x: 96, y: 42, size: 14, dur: 78  },
  { t: "KL(p‖q)", x: 89, y: 60, size: 10, dur: 118 },
  { t: "f(x)→ŷ", x: 94, y: 25, size: 11, dur: 72  },
  { t: "ReLU(x)", x: 92, y: 75, size: 12, dur: 88  },
];

interface SymPos { x: number; y: number; popped: boolean; }

/* ─── Zone 1: neural network ─────────────────────────────────────────────── */

const NN_NODES = [
  [12, 14], [13, 27], [11, 40], [14, 53], [12, 66], [11, 79],
  [36, 11], [38, 24], [35, 37], [37, 50], [39, 63], [36, 76],
  [62, 17], [60, 30], [63, 43], [61, 56], [64, 69], [62, 82],
  [87, 14], [85, 27], [88, 40], [86, 53], [87, 66], [89, 79],
];

const NN_LINES: [number, number][] = [
  [0,6],[0,7],[1,6],[1,7],[1,8],[2,7],[2,8],[2,9],
  [3,8],[3,9],[3,10],[4,9],[4,10],[4,11],[5,10],[5,11],
  [6,12],[6,13],[7,12],[7,13],[7,14],[8,13],[8,14],[8,15],
  [9,14],[9,15],[9,16],[10,15],[10,16],[10,17],[11,16],[11,17],
  [12,18],[12,19],[13,18],[13,19],[13,20],[14,19],[14,20],[14,21],
  [15,20],[15,21],[15,22],[16,21],[16,22],[16,23],[17,22],[17,23],
];

/* ─── Zone 3: sine waves ─────────────────────────────────────────────────── */

const SINE_WAVES = [
  { amp: 30, freq: 0.5, phase: 0,             cy: 220, dur: 55, op: 0.05 },
  { amp: 20, freq: 0.8, phase: Math.PI / 2,   cy: 430, dur: 40, op: 0.04 },
  { amp: 50, freq: 0.3, phase: Math.PI,       cy: 630, dur: 70, op: 0.06 },
  { amp: 35, freq: 0.6, phase: Math.PI * 1.5, cy: 850, dur: 60, op: 0.05 },
];

function buildSinePath(amp: number, freq: number, phase: number, cy: number): string {
  let d = "";
  for (let x = 0; x <= 1920; x += 8) {
    const y = cy + amp * Math.sin((x / 1920) * Math.PI * 2 * freq + phase);
    d += x === 0 ? `M${x},${y.toFixed(1)}` : `L${x},${y.toFixed(1)}`;
  }
  return d;
}

const SINE_PATHS = SINE_WAVES.map((w) => ({
  ...w,
  d: buildSinePath(w.amp, w.freq, w.phase, w.cy),
}));

/* ─── Observer config ────────────────────────────────────────────────────── */

const ZONE_MAP: Record<string, number> = {
  hero: 0, metrics: 1, projects: 2, identity: 2, writing: 3, footer: 4,
};
const SECTION_IDS = Object.keys(ZONE_MAP);

/* ─── Component ──────────────────────────────────────────────────────────── */

export function ScrollBackground() {
  const [zone,          setZone]          = useState(0);
  const [active,        setActive]        = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [symPos,        setSymPos]        = useState<SymPos[]>(() =>
    MATH_SYMBOLS.map((s) => ({ x: s.x, y: s.y, popped: false }))
  );

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(rm);
    setActive(true);

    if (rm) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const z = ZONE_MAP[entry.target.id];
            if (z !== undefined) setZone(z);
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSymbolClick = (index: number) => {
    if (reducedMotion) return;
    const isLeft = symPos[index].x < 50;

    setSymPos((prev) =>
      prev.map((s, i) => (i === index ? { ...s, popped: true } : s))
    );

    setTimeout(() => {
      const newX = isLeft ? 1 + Math.random() * 9 : 88 + Math.random() * 10;
      const newY = 60 + Math.random() * 30;
      setSymPos((prev) =>
        prev.map((s, i) => (i === index ? { x: newX, y: newY, popped: false } : s))
      );
    }, 720);
  };

  if (!active) return null;

  const layerStyle = (zoneIndex: number): React.CSSProperties => ({
    position: "fixed",
    inset: 0,
    opacity: reducedMotion ? 0.4 : zone === zoneIndex ? 1 : 0,
    transition: reducedMotion ? "none" : "opacity 800ms ease-in-out",
    pointerEvents: "none",
    zIndex: -1,
    overflow: "hidden",
  });

  return (
    <>
      {/* Zone 0: interactive math symbols — side margins only */}
      <div style={layerStyle(0)}>
        {MATH_SYMBOLS.map((sym, i) => {
          const pos   = symPos[i];
          const color = i % 5 === 0
            ? "rgba(234, 88, 12, 0.09)"
            : "rgba(180, 100, 40, 0.06)";

          return (
            <span
              key={i}
              onClick={() => handleSymbolClick(i)}
              className={`sb-symbol${pos.popped ? " symbol-pop" : ""}`}
              aria-hidden
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top:  `${pos.y}%`,
                fontFamily: "var(--font-mono)",
                fontSize:   `${sym.size}px`,
                color,
                animation: pos.popped
                  ? "none"
                  : `symbolFloat ${sym.dur}s ease-in-out infinite`,
                animationDelay: pos.popped
                  ? undefined
                  : `${(i * 3.7) % 12}s`,
                willChange:    "transform",
                userSelect:    "none",
                whiteSpace:    "nowrap",
                pointerEvents: "auto",
                cursor:        "default",
                "--symbol-opacity": 1,
              } as React.CSSProperties}
            >
              {sym.t}
            </span>
          );
        })}
      </div>

      {/* Zone 1: neural network — full width */}
      <div style={layerStyle(1)}>
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden
        >
          {NN_LINES.map(([i, j], k) => (
            <line
              key={k}
              x1={`${NN_NODES[i][0]}%`}
              y1={`${NN_NODES[i][1]}%`}
              x2={`${NN_NODES[j][0]}%`}
              y2={`${NN_NODES[j][1]}%`}
              stroke="rgba(234, 88, 12, 0.04)"
              strokeWidth="1"
              style={{
                animation: `linePulse ${10 + (k % 6)}s ease-in-out infinite`,
                animationDelay: `${(k * 0.7) % 5}s`,
              }}
            />
          ))}
          {NN_NODES.map(([x, y], i) => (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill="rgba(234, 88, 12, 0.10)"
              style={{
                transformBox:    "fill-box",
                transformOrigin: "center",
                animation: `nodePulse ${3 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${(i * 0.4) % 3}s`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Zone 2: precise dot grid — full width */}
      <div style={layerStyle(2)}>
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden
        >
          <defs>
            <pattern
              id="sb-small-dots"
              x="0" y="0" width="36" height="36"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="18" cy="18" r="0.75"
                fill="rgba(234, 88, 12, 0.05)" />
            </pattern>
            <pattern
              id="sb-large-dots"
              x="0" y="0" width="216" height="216"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="18" cy="18" r="1.25"
                fill="rgba(234, 88, 12, 0.09)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sb-small-dots)" />
          <rect width="100%" height="100%" fill="url(#sb-large-dots)" />
        </svg>
      </div>

      {/* Zone 3: sine waves — full width */}
      <div style={layerStyle(3)}>
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
          style={{ position: "absolute", width: "100%", height: "100%" }}
          aria-hidden
        >
          {SINE_PATHS.map((wave, i) => (
            <path
              key={i}
              d={wave.d}
              fill="none"
              stroke="rgba(234, 88, 12, 1)"
              strokeWidth="1"
              style={{
                opacity: wave.op,
                animation: `sineDrift ${wave.dur}s ease-in-out infinite`,
                animationDelay: `${i * 4}s`,
                willChange: "transform",
              }}
            />
          ))}
        </svg>
      </div>

      {/* Zone 4: warm radial glow */}
      <div
        style={{
          ...layerStyle(4),
          background:
            "radial-gradient(ellipse at center, rgba(234,88,12,0.04) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
