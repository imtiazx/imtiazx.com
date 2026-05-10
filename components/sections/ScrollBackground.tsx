"use client";

import { useEffect, useState } from "react";

const MATH_NODES = [
  { t: "Σ",       x: 8,  y: 15, dur: 18 },
  { t: "∫f(x)dx", x: 75, y: 8,  dur: 22 },
  { t: "∇²", x: 20, y: 72, dur: 16 },
  { t: "σ²", x: 85, y: 55, dur: 25 },
  { t: "P(A|B)",       x: 45, y: 20, dur: 20 },
  { t: "λe⁻λ", x: 60, y: 80, dur: 15 },
  { t: "argmax",       x: 10, y: 45, dur: 23 },
  { t: "∂L/∂w", x: 90, y: 30, dur: 19 },
  { t: "O(n·log·n)", x: 35, y: 60, dur: 21 },
  { t: "μ±σ", x: 70, y: 40, dur: 17 },
  { t: "R²",      x: 55, y: 15, dur: 24 },
  { t: "softmax",      x: 25, y: 88, dur: 14 },
];

const NEURAL_DOTS = [
  { x: 10, y: 20 }, { x: 30, y: 15 }, { x: 50, y: 25 },
  { x: 70, y: 10 }, { x: 85, y: 30 }, { x: 15, y: 50 },
  { x: 35, y: 60 }, { x: 55, y: 45 }, { x: 75, y: 55 },
  { x: 90, y: 70 }, { x: 20, y: 80 }, { x: 40, y: 75 },
  { x: 60, y: 85 }, { x: 80, y: 40 }, { x: 5,  y: 65 },
  { x: 45, y: 35 }, { x: 65, y: 20 }, { x: 25, y: 40 },
  { x: 50, y: 70 }, { x: 95, y: 50 },
];

const NEURAL_LINES: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[2,7],[3,8],[4,9],
  [5,6],[6,7],[7,8],[8,9],[10,11],[12,13],
];

function buildSinePath(amp: number, freq: number, phase: number, cy: number): string {
  let d = "";
  for (let x = 0; x <= 1920; x += 8) {
    const y = cy + amp * Math.sin((x / 1920) * Math.PI * 2 * freq + phase);
    d += x === 0 ? `M${x},${y}` : `L${x},${y}`;
  }
  return d;
}

const SINE_PATHS = [
  buildSinePath(40, 2,   0,           300),
  buildSinePath(25, 3,   Math.PI / 3, 540),
  buildSinePath(50, 1.5, Math.PI,     780),
];

const ZONE_MAP: Record<string, number> = {
  hero: 0, metrics: 1, projects: 2, identity: 2, writing: 3, footer: 4,
};

const SECTION_IDS = Object.keys(ZONE_MAP);

export function ScrollBackground() {
  const [zone, setZone] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setActive(true);

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

  if (!active) return null;

  const layer = (visible: boolean): React.CSSProperties => ({
    position: "fixed",
    inset: 0,
    opacity: visible ? 1 : 0,
    transition: "opacity 800ms ease",
    pointerEvents: "none",
    zIndex: -1,
    overflow: "hidden",
  });

  return (
    <>
      {/* Zone 0: floating math symbols */}
      <div style={layer(zone === 0)}>
        {MATH_NODES.map((node, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${node.x}%`,
              top: `${node.y}%`,
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--color-brand)",
              opacity: 0.06,
              animation: `symbolFloat ${node.dur}s ease-in-out infinite`,
              animationDelay: `${(i * 1.3) % 5}s`,
              willChange: "transform",
              userSelect: "none",
            }}
            aria-hidden
          >
            {node.t}
          </span>
        ))}
      </div>

      {/* Zone 1: neural network nodes and lines */}
      <div style={layer(zone === 1)}>
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden
        >
          {NEURAL_LINES.map(([i, j], k) => (
            <line
              key={k}
              x1={`${NEURAL_DOTS[i].x}%`}
              y1={`${NEURAL_DOTS[i].y}%`}
              x2={`${NEURAL_DOTS[j].x}%`}
              y2={`${NEURAL_DOTS[j].y}%`}
              stroke="var(--color-brand)"
              strokeWidth="0.5"
              style={{
                opacity: 0.05,
                animation: `linePulse ${8 + k}s ease-in-out infinite`,
                animationDelay: `${k * 0.5}s`,
              }}
            />
          ))}
          {NEURAL_DOTS.map((dot, i) => (
            <circle
              key={i}
              cx={`${dot.x}%`}
              cy={`${dot.y}%`}
              r="3"
              fill="var(--color-brand)"
              style={{
                opacity: 0.05,
                animation: `neuralPulse ${6 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Zone 2: dot grid */}
      <div style={layer(zone === 2)}>
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden
        >
          <defs>
            <pattern
              id="sbDotGrid"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1.5" fill="var(--color-brand)" fillOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sbDotGrid)" />
        </svg>
      </div>

      {/* Zone 3: sine waves */}
      <div style={layer(zone === 3)}>
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
          style={{ position: "absolute", width: "100%", height: "100%" }}
          aria-hidden
        >
          {SINE_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="1.5"
              style={{
                opacity: 0.05,
                animation: `sineDrift ${20 + i * 5}s ease-in-out infinite`,
                willChange: "transform",
              }}
            />
          ))}
        </svg>
      </div>

      {/* Zone 4: empty */}
      <div style={layer(zone === 4)} />
    </>
  );
}
