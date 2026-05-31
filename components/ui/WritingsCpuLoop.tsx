"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Cpu } from "lucide-react";
import { useInView } from "@/lib/useInView";

export interface CpuLoopItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  icon: React.ElementType;
  href: string;
}

interface WritingsCpuLoopProps {
  items: CpuLoopItem[];
}

// CPU "die" dimensions in SVG coords (centered at 0,0). The pin halves extend
// slightly past the inner die so wires terminate where the pin strips visually
// end; the *_RANGE values clamp pin landings into the actual pin-strip span so
// no trace meets the chip at a corner gap.
const PIN_HALF_W = 70;
const PIN_HALF_H = 70;
const PIN_X_RANGE = 38;
const PIN_Y_RANGE = 38;
const ICON_RADIUS = 24;
const STUB = 8;

type PinSide = "right" | "left" | "top" | "bottom";

interface Pin {
  x: number;
  y: number;
  side: PinSide;
}

function squirclePoint(t: number, a: number, b: number, n = 4) {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const ex = 2 / n;
  return {
    x: a * Math.sign(c) * Math.pow(Math.abs(c), ex),
    y: b * Math.sign(s) * Math.pow(Math.abs(s), ex),
  };
}

/** Squircle point at a given center-angle. Unlike squirclePoint (which uses a
 *  parametric t), this places points so that equal angle steps from the origin
 *  yield equal-arc visual stepping — required to keep the rotating spotlight
 *  from "jumping" across the wide top/bottom of an oblong squircle. */
function squircleAtAngle(theta: number, a: number, b: number, n = 4) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  // Solve r so (r cos θ / a)^n + (r sin θ / b)^n = 1.
  const inv = Math.pow(Math.abs(c) / a, n) + Math.pow(Math.abs(s) / b, n);
  const r = Math.pow(inv, -1 / n);
  return { x: r * c, y: r * s };
}

/** Find where a ray from the CPU center at the given angle exits the chip
 *  outer rectangle, clamped to the visible pin-strip span on that side. */
function cpuPinAndSide(angle: number): Pin {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const tx = c !== 0 ? PIN_HALF_W / Math.abs(c) : Infinity;
  const ty = s !== 0 ? PIN_HALF_H / Math.abs(s) : Infinity;
  if (tx <= ty) {
    const py = Math.max(-PIN_Y_RANGE, Math.min(PIN_Y_RANGE, tx * s));
    return { x: Math.sign(c) * PIN_HALF_W, y: py, side: c >= 0 ? "right" : "left" };
  }
  const px = Math.max(-PIN_X_RANGE, Math.min(PIN_X_RANGE, ty * c));
  return { x: px, y: Math.sign(s) * PIN_HALF_H, side: s >= 0 ? "bottom" : "top" };
}

/** Build a Manhattan-routed PCB trace from CPU pin to a node, leaving the chip
 *  perpendicular to its edge and terminating just outside the icon. */
function buildTrace(pin: Pin, nx: number, ny: number) {
  let stubX = 0;
  let stubY = 0;
  if (pin.side === "right") stubX = STUB;
  else if (pin.side === "left") stubX = -STUB;
  else if (pin.side === "top") stubY = -STUB;
  else stubY = STUB;

  const sx = pin.x + stubX;
  const sy = pin.y + stubY;

  let midX: number;
  let midY: number;
  let endX: number;
  let endY: number;

  if (pin.side === "right" || pin.side === "left") {
    midX = sx;
    midY = ny;
    endY = ny;
    endX = pin.side === "right" ? nx - ICON_RADIUS : nx + ICON_RADIUS;
  } else {
    midX = nx;
    midY = sy;
    endX = nx;
    endY = pin.side === "top" ? ny + ICON_RADIUS : ny - ICON_RADIUS;
  }

  return {
    path: `M ${pin.x} ${pin.y} L ${sx} ${sy} L ${midX} ${midY} L ${endX} ${endY}`,
    endpoint: { x: endX, y: endY },
  };
}

/**
 * Squircle-path "motherboard" loop. The outer dashed superellipse reads as a
 * PCB edge; nodes sit on its perimeter as surface-mount components. Each node
 * is wired back to the central CPU via a Manhattan-routed trace that leaves the
 * chip perpendicular to its edge and lands just outside the component pad. Pin
 * positions slide continuously around the chip perimeter as nodes rotate, so
 * the wires reroute smoothly without snapping. Clicking a node pauses motion,
 * highlights its trace, and opens an expanded card.
 */
export default function WritingsCpuLoop({ items }: WritingsCpuLoopProps) {
  const [containerRef, inView] = useInView<HTMLDivElement>({ rootMargin: "200px" });
  const loopRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [autoRun, setAutoRun] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Index of the perimeter node currently glowing with the CPU's pulse. The
  // CPU's cpuSealPulse animation drives this — every full iteration advances
  // the spotlight so the central chip and a single component blink as one.
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  const [dims, setDims] = useState({ a: 360, b: 270 });
  useEffect(() => {
    const update = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      if (w < 480) setDims({ a: 150, b: 150 });
      else if (w < 768) setDims({ a: 220, b: 200 });
      else if (w < 1280) setDims({ a: 300, b: 240 });
      else setDims({ a: 380, b: 280 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!autoRun || !inView) return;
    const id = setInterval(() => {
      setPhase((p) => (p + 0.004) % (2 * Math.PI));
    }, 50);
    return () => clearInterval(id);
  }, [autoRun, inView]);

  // Advance the spotlight on every full cycle of the CPU seal's pulse. Phase
  // locks node + chip glow without depending on a JS interval staying in sync
  // with the CSS animation. Paused when the section scrolls offscreen.
  useEffect(() => {
    if (!autoRun || activeId !== null || !inView) return;
    const el = sealRef.current;
    if (!el) return;
    const onIter = () => {
      setSpotlightIdx((i) => (i + 1) % items.length);
    };
    el.addEventListener("animationiteration", onIter);
    return () => el.removeEventListener("animationiteration", onIter);
  }, [autoRun, activeId, items.length, inView]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === loopRef.current) {
      setActiveId(null);
      setAutoRun(true);
    }
  };

  const toggleItem = (id: string) => {
    if (activeId === id) {
      setActiveId(null);
      setAutoRun(true);
    } else {
      setActiveId(id);
      setAutoRun(false);
    }
  };

  // Compute node positions, pins, and traces every frame. With 5 items this is
  // ~20 path segments per tick — trivial work compared to React render.
  // Items are placed by even angle-from-center (not even parametric t) so the
  // rotating spotlight steps through visually equal arcs around the squircle
  // instead of clustering on the short sides and jumping the wide top/bottom.
  const placements = items.map((item, index) => {
    const theta = (index / items.length) * 2 * Math.PI + phase;
    const { x: nx, y: ny } = squircleAtAngle(theta, dims.a, dims.b);
    const pin = cpuPinAndSide(theta);
    const trace = buildTrace(pin, nx, ny);
    return { item, nx, ny, pin, trace };
  });

  // Static elements that don't depend on phase — die outline + decorative vias.
  const { dieOutline, vias } = useMemo(() => {
    const N = 240;
    const outlinePts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * 2 * Math.PI;
      const { x, y } = squirclePoint(t, dims.a, dims.b);
      outlinePts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    // Decorative via dots scattered between CPU and outer edge for motherboard
    // texture. Positions are deterministic, not random, to avoid hydration drift.
    const v: { x: number; y: number }[] = [];
    const ringRadii = [0.55, 0.78];
    const ringCounts = [10, 14];
    ringRadii.forEach((r, ri) => {
      const count = ringCounts[ri];
      for (let i = 0; i < count; i++) {
        const t = (i / count) * 2 * Math.PI + ri * 0.18;
        const { x, y } = squirclePoint(t, dims.a * r, dims.b * r);
        v.push({ x, y });
      }
    });
    return { dieOutline: outlinePts.join(" "), vias: v };
  }, [dims]);

  const vbMargin = 32;
  const vbW = dims.a * 2 + vbMargin * 2;
  const vbH = dims.b * 2 + vbMargin * 2;

  const wireStroke = (id: string, idx: number) => {
    if (activeId === id) return "var(--color-brand)";
    if (activeId) return "color-mix(in srgb, var(--color-brand) 14%, transparent)";
    if (autoRun && spotlightIdx === idx)
      return "color-mix(in srgb, var(--color-brand) 70%, transparent)";
    return "color-mix(in srgb, var(--color-brand) 32%, transparent)";
  };
  const wireWidth = (id: string, idx: number) => {
    if (activeId === id) return 1.8;
    if (!activeId && autoRun && spotlightIdx === idx) return 1.4;
    return 1;
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        height: "min(820px, 92vh)",
        minHeight: 640,
      }}
    >
      <div
        ref={loopRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg
          aria-hidden
          viewBox={`-${vbW / 2} -${vbH / 2} ${vbW} ${vbH}`}
          style={{
            position: "absolute",
            width: vbW,
            height: vbH,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          {/* Decorative via dots — motherboard texture, behind everything */}
          {vias.map((v, i) => (
            <circle
              key={i}
              cx={v.x}
              cy={v.y}
              r={1.2}
              fill="color-mix(in srgb, var(--color-brand) 22%, transparent)"
            />
          ))}

          {/* PCB traces from CPU pins to each node */}
          {placements.map(({ item, pin, trace }, idx) => {
            const stroke = wireStroke(item.id, idx);
            const width = wireWidth(item.id, idx);
            const isActive = activeId === item.id;
            return (
              <g key={`wire-${item.id}`}>
                <path
                  d={trace.path}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={width}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 0 4px color-mix(in srgb, var(--color-brand) 60%, transparent))"
                      : "none",
                    transition: "stroke 320ms ease, stroke-width 320ms ease",
                  }}
                />
                {/* Pin pad on CPU side */}
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r={2}
                  fill={stroke}
                  style={{ transition: "fill 320ms ease" }}
                />
                {/* Via dot at component pad */}
                <circle
                  cx={trace.endpoint.x}
                  cy={trace.endpoint.y}
                  r={2}
                  fill={stroke}
                  style={{ transition: "fill 320ms ease" }}
                />
              </g>
            );
          })}

          {/* Outer board outline (PCB edge) */}
          <polyline
            points={dieOutline}
            fill="none"
            stroke="color-mix(in srgb, var(--color-brand) 28%, transparent)"
            strokeWidth={1}
            strokeDasharray="3 6"
            strokeLinecap="round"
          />
          {/* Corner pin ticks */}
          {[
            [dims.a, 0],
            [-dims.a, 0],
            [0, dims.b],
            [0, -dims.b],
          ].map(([x, y], i) => (
            <line
              key={`tick-${i}`}
              x1={x}
              y1={y}
              x2={x * 1.06}
              y2={y * 1.06}
              stroke="color-mix(in srgb, var(--color-brand) 55%, transparent)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Central CPU die */}
        <div ref={sealRef} className="cpu-seal" aria-hidden>
          <div className="cpu-seal-inner">
            <Cpu size={32} color="var(--color-brand)" strokeWidth={1.6} />
            <span className="cpu-led" />
          </div>
        </div>

        {/* Nodes (icons + labels + cards) */}
        {placements.map(({ item, nx, ny }, idx) => {
          const t = items.findIndex((i) => i.id === item.id);
          const isActive = activeId === item.id;
          const isDimmed = activeId !== null && !isActive;
          const isSpotlight =
            autoRun && activeId === null && spotlightIdx === idx;
          const Icon = item.icon;

          const openUp = ny > 10;
          const horizontalAnchor =
            nx > dims.a * 0.55
              ? { right: "calc(50% + 56px)", left: "auto", translate: "translateX(0)" }
              : nx < -dims.a * 0.55
              ? { left: "calc(50% + 56px)", right: "auto", translate: "translateX(0)" }
              : { left: "50%", right: "auto", translate: "translateX(-50%)" };

          return (
            <div
              key={`node-${item.id}-${t}`}
              className={`absolute ${isSpotlight ? "cpu-spotlight" : ""}`}
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`,
                transition: autoRun
                  ? "none"
                  : "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: isActive ? 200 : 100,
                opacity: isDimmed ? 0.45 : 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
            >
              {/* Pad backing — subtle component footprint */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: -7,
                  borderRadius: 12,
                  border:
                    "1px dashed color-mix(in srgb, var(--color-brand) 18%, transparent)",
                  pointerEvents: "none",
                }}
              />
              {/* Halo */}
              <div
                aria-hidden
                className="cpu-halo"
                style={{
                  position: "absolute",
                  width: 64,
                  height: 64,
                  left: -10,
                  top: -10,
                  borderRadius: "9999px",
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--color-brand) 22%, transparent) 0%, transparent 70%)",
                  pointerEvents: "none",
                  opacity: isActive ? 1 : 0.5,
                  transition: "opacity 300ms ease",
                }}
              />

              {/* Node chip */}
              <button
                type="button"
                aria-label={item.title}
                className="cpu-node"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  backgroundColor: isActive
                    ? "var(--color-brand)"
                    : "var(--color-surface)",
                  borderColor: isActive
                    ? "var(--color-brand)"
                    : "color-mix(in srgb, var(--color-brand) 45%, transparent)",
                  color: isActive ? "#FFFFFF" : "var(--color-text-secondary)",
                  boxShadow: isActive
                    ? "0 0 22px 6px color-mix(in srgb, var(--color-brand) 45%, transparent)"
                    : "0 2px 10px rgba(0, 0, 0, 0.08)",
                  transform: isActive ? "scale(1.25) rotate(-6deg)" : "rotate(0)",
                  transition: "all 320ms cubic-bezier(0.22, 1, 0.36, 1)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
              </button>

              {/* Title label below node — mono, brand-muted, not uppercase.
                  Fades out when this node is active (the card title takes over). */}
              <div
                className="cpu-node-label"
                style={{
                  position: "absolute",
                  top: 56,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 160,
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.02em",
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: isActive
                    ? "var(--color-brand)"
                    : "var(--color-text-muted)",
                  opacity: isActive ? 0 : 1,
                  transition: "opacity 220ms ease, color 220ms ease",
                  pointerEvents: "none",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3,
                  overflow: "hidden",
                }}
              >
                {item.title}
              </div>

              {isActive && (
                <div
                  className="cpu-card"
                  style={{
                    position: "absolute",
                    ...(openUp
                      ? { bottom: 64, top: "auto" }
                      : { top: 64, bottom: "auto" }),
                    left: horizontalAnchor.left,
                    right: horizontalAnchor.right,
                    transform: horizontalAnchor.translate,
                    width: 340,
                    maxWidth: "90vw",
                    backgroundColor: "var(--color-surface)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-brand) 35%, var(--color-border))",
                    borderRadius: 14,
                    padding: 22,
                    boxShadow:
                      "0 18px 50px color-mix(in srgb, var(--color-brand) 18%, transparent), 0 4px 14px rgba(0,0,0,0.10)",
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      ...(openUp ? { bottom: -10 } : { top: -10 }),
                      left:
                        horizontalAnchor.left === "50%"
                          ? "50%"
                          : horizontalAnchor.right === "auto"
                          ? 24
                          : "auto",
                      right:
                        horizontalAnchor.right !== "auto" &&
                        horizontalAnchor.left === "auto"
                          ? 24
                          : "auto",
                      width: 1,
                      height: 10,
                      backgroundColor:
                        "color-mix(in srgb, var(--color-brand) 60%, transparent)",
                      transform:
                        horizontalAnchor.left === "50%"
                          ? "translateX(-50%)"
                          : "none",
                    }}
                  />

                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    {item.category}
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      fontSize: 22,
                      lineHeight: 1.22,
                      letterSpacing: "-0.01em",
                      color: "var(--color-brand)",
                      textShadow:
                        "0 0 16px color-mix(in srgb, var(--color-brand) 55%, transparent), 0 0 32px color-mix(in srgb, var(--color-brand) 28%, transparent)",
                      margin: 0,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-text-secondary)",
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      marginTop: 12,
                    }}
                  >
                    {item.excerpt}
                  </p>

                  <a
                    href={item.href}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 14,
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--color-brand)",
                    }}
                  >
                    Read the piece
                    <span aria-hidden style={{ transform: "translateY(-1px)" }}>
                      →
                    </span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .cpu-seal {
          position: relative;
          width: 128px;
          height: 128px;
          border-radius: 18px;
          border: 1.5px solid
            color-mix(in srgb, var(--color-brand) 35%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          background-color: color-mix(in srgb, var(--color-bg) 78%, transparent);
          backdrop-filter: blur(6px);
          animation: cpuSealPulse 2.8s ease-in-out infinite;
        }
        .cpu-seal::before,
        .cpu-seal::after {
          content: "";
          position: absolute;
          background: color-mix(in srgb, var(--color-brand) 60%, transparent);
          border-radius: 1px;
        }
        .cpu-seal::before {
          top: -10px;
          left: 22%;
          right: 22%;
          height: 6px;
          background: repeating-linear-gradient(
            to right,
            color-mix(in srgb, var(--color-brand) 60%, transparent) 0 2px,
            transparent 2px 8px
          );
        }
        .cpu-seal::after {
          bottom: -10px;
          left: 22%;
          right: 22%;
          height: 6px;
          background: repeating-linear-gradient(
            to right,
            color-mix(in srgb, var(--color-brand) 60%, transparent) 0 2px,
            transparent 2px 8px
          );
        }
        .cpu-seal-inner {
          position: relative;
          width: 104px;
          height: 104px;
          border-radius: 14px;
          background-color: color-mix(in srgb, var(--color-surface) 92%, transparent);
          border: 0.5px solid
            color-mix(in srgb, var(--color-brand) 25%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cpu-seal-inner::before,
        .cpu-seal-inner::after {
          content: "";
          position: absolute;
          top: 22%;
          bottom: 22%;
          width: 6px;
          background: repeating-linear-gradient(
            to bottom,
            color-mix(in srgb, var(--color-brand) 60%, transparent) 0 2px,
            transparent 2px 8px
          );
        }
        .cpu-seal-inner::before {
          left: -16px;
        }
        .cpu-seal-inner::after {
          right: -16px;
        }
        .cpu-led {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background-color: var(--color-brand);
          box-shadow: 0 0 8px var(--color-brand);
          animation: cpuLedBlink 1.4s steps(1, end) infinite;
        }
        .cpu-node:hover {
          border-color: var(--color-brand) !important;
          color: var(--color-brand) !important;
          transform: scale(1.08) !important;
        }
        @keyframes cpuSealPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-brand) 0%, transparent);
            border-color: color-mix(in srgb, var(--color-brand) 35%, transparent);
          }
          50% {
            box-shadow: 0 0 32px 10px
              color-mix(in srgb, var(--color-brand) 28%, transparent);
            border-color: color-mix(in srgb, var(--color-brand) 70%, transparent);
          }
        }
        @keyframes cpuLedBlink {
          0%,
          55% {
            opacity: 1;
          }
          60%,
          100% {
            opacity: 0.2;
          }
        }
        /* Rotating spotlight: a single 2.8s pulse on the currently lit node,
           timed to cpuSealPulse so the chip and one component blink as one. */
        .cpu-spotlight .cpu-node {
          animation: cpuNodeBlink 2.8s ease-in-out;
        }
        .cpu-spotlight .cpu-halo {
          animation: cpuHaloBlink 2.8s ease-in-out;
        }
        .cpu-spotlight .cpu-node-label {
          animation: cpuLabelBlink 2.8s ease-in-out;
        }
        @keyframes cpuNodeBlink {
          0%,
          100% {
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            border-color: color-mix(in srgb, var(--color-brand) 45%, transparent);
            color: var(--color-text-secondary);
          }
          50% {
            box-shadow: 0 0 24px 6px
              color-mix(in srgb, var(--color-brand) 50%, transparent);
            border-color: var(--color-brand);
            color: var(--color-brand);
          }
        }
        @keyframes cpuHaloBlink {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }
        @keyframes cpuLabelBlink {
          0%,
          100% {
            color: var(--color-text-muted);
            text-shadow: none;
          }
          50% {
            color: var(--color-brand);
            text-shadow: 0 0 10px
              color-mix(in srgb, var(--color-brand) 55%, transparent);
          }
        }
      `}</style>
    </div>
  );
}
