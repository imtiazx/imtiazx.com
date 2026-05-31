"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Heart, MessageCircle, Repeat2 } from "lucide-react";
import {
  cryptoStats,
  cryptoSpecialties,
  cryptoTweets,
  type CryptoTweet,
} from "@/lib/crypto";
import { person } from "@/lib/person";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const HEADING = "What I Track";
const SUBTEXT =
  "On-chain since 2018. Eight years of ecosystem research, risk analysis, and portfolio management across full market cycles.";

// ----------------------------------------------------------------------------
// Particle mesh — references crypto001.jpg. A constellation of nodes confined
// to a defined outer polygon ring (close-to-circle), with three crypto icons
// (BTC, ETH, SOL) orbiting the centroid. Each icon carries a small uncertainty
// jitter so its position is never exactly predictable — a nod to the
// heisenberg-style framing.
// ----------------------------------------------------------------------------
const MESH_W = 480;
const MESH_H = 440;
const MESH_NODE_COUNT = 56;
const MESH_CENTER = { x: MESH_W / 2, y: MESH_H / 2 };
const MESH_RADIUS = 130;
const EDGE_DIST = 56;
const OUTER_RING_RADIUS = 175;
const OUTER_RING_SIDES = 14;
// Each polygon vertex draws a few short edges to its nearest interior nodes
// (within this radius), so the outer ring reads as part of the same mesh
// rather than a separate orbiting layer.
const POLYGON_CONNECT_DIST = 110;
const POLYGON_NEAREST_COUNT = 3;

interface MeshNode {
  x: number;
  y: number;
  r: number;
  phase: number;
  amp: number;
}

interface MeshEdge {
  a: number;
  b: number;
  d: number;
}

// Deterministic PRNG so the mesh is identical across renders/SSR.
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMesh(): { nodes: MeshNode[]; edges: MeshEdge[] } {
  const rand = mulberry32(20180601);
  const nodes: MeshNode[] = [];
  for (let i = 0; i < MESH_NODE_COUNT; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = Math.pow(rand(), 0.65) * MESH_RADIUS;
    const x = MESH_CENTER.x + Math.cos(angle) * radius;
    const y = MESH_CENTER.y + Math.sin(angle) * radius;
    nodes.push({
      x,
      y,
      r: 1.4 + rand() * 1.6,
      phase: rand() * Math.PI * 2,
      amp: 1.4 + rand() * 2,
    });
  }
  const edges: MeshEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d = Math.hypot(dx, dy);
      if (d < EDGE_DIST) edges.push({ a: i, b: j, d });
    }
  }
  return { nodes, edges };
}

// Outer ring: 14-sided polygon, close enough to a circle to read as a ring
// but with enough segmentation to feel engineered. Vertices are pre-computed
// so they don't recalc on every render.
const OUTER_RING_VERTICES = Array.from(
  { length: OUTER_RING_SIDES },
  (_, i) => {
    const angle = (i / OUTER_RING_SIDES) * Math.PI * 2 - Math.PI / 2;
    return {
      x: MESH_CENTER.x + Math.cos(angle) * OUTER_RING_RADIUS,
      y: MESH_CENTER.y + Math.sin(angle) * OUTER_RING_RADIUS,
    };
  },
);
const OUTER_RING_POINTS = OUTER_RING_VERTICES.map((p) => `${p.x},${p.y}`).join(
  " ",
);

interface OrbitingIcon {
  symbol: "BTC" | "ETH" | "SOL";
  baseAngle: number;
  speed: number;
  radius: number;
}

const ORBITS: OrbitingIcon[] = [
  { symbol: "BTC", baseAngle: 0, speed: 0.00022, radius: 105 },
  { symbol: "ETH", baseAngle: (Math.PI * 2) / 3, speed: 0.00028, radius: 130 },
  { symbol: "SOL", baseAngle: (Math.PI * 4) / 3, speed: 0.00019, radius: 90 },
];

function CryptoGlyph({
  symbol,
  size = 22,
}: {
  symbol: OrbitingIcon["symbol"] | "GENERIC";
  size?: number;
}) {
  if (symbol === "BTC") {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#F7931A" />
        <path
          fill="#FFFFFF"
          d="M21.5 14.3c.3-1.9-1.2-2.9-3.2-3.6l.6-2.5-1.5-.4-.6 2.4c-.4-.1-.8-.2-1.2-.3l.6-2.5-1.5-.4-.6 2.5c-.3-.1-.7-.2-1-.2l-2.1-.5-.4 1.6s1.1.3 1.1.3c.6.2.7.6.7.9l-.7 2.8c0 0 .1 0 .2.1-.1 0-.1 0-.2-.1l-1 4c-.1.2-.3.5-.7.4 0 0-1.1-.3-1.1-.3l-.8 1.7 2 .5c.4.1.7.2 1.1.3l-.6 2.5 1.5.4.6-2.5c.4.1.8.2 1.2.3l-.6 2.5 1.5.4.6-2.5c2.6.5 4.5.3 5.3-2 .7-1.9-.1-2.9-1.4-3.6.9-.2 1.7-.9 1.9-2.2zm-3.4 4.8c-.5 1.9-3.7.9-4.7.6l.8-3.3c1 .3 4.3.7 3.9 2.7zm.4-4.9c-.4 1.7-3.1.9-3.9.6l.7-3c.8.2 3.6.6 3.2 2.4z"
        />
      </svg>
    );
  }
  if (symbol === "ETH") {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#627EEA" />
        <path fill="#FFFFFF" fillOpacity="0.6" d="M16.5 4v8.87l7.5 3.35z" />
        <path fill="#FFFFFF" d="M16.5 4 9 16.22l7.5-3.35z" />
        <path fill="#FFFFFF" fillOpacity="0.6" d="M16.5 21.97v6.02L24 17.62z" />
        <path fill="#FFFFFF" d="M16.5 27.99v-6.02L9 17.62z" />
        <path fill="#FFFFFF" fillOpacity="0.2" d="m16.5 20.57 7.5-4.35-7.5-3.35z" />
        <path fill="#FFFFFF" fillOpacity="0.6" d="m9 16.22 7.5 4.35v-7.7z" />
      </svg>
    );
  }
  if (symbol === "SOL") {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id="sol-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="15" fill="#0B0B14" />
        <path
          d="M9 21.3l1.6-1.7a.6.6 0 0 1 .5-.2h11.5c.3 0 .5.4.3.6l-1.6 1.7a.6.6 0 0 1-.5.2H9.3c-.3 0-.5-.4-.3-.6zM9 11l1.6-1.7a.6.6 0 0 1 .5-.2h11.5c.3 0 .5.4.3.6l-1.6 1.7a.6.6 0 0 1-.5.2H9.3c-.3 0-.5-.4-.3-.6zM22.7 16.2l-1.6 1.7a.6.6 0 0 1-.5.2H9.1c-.3 0-.5-.4-.3-.6l1.6-1.7a.6.6 0 0 1 .5-.2H22.4c.3 0 .5.4.3.6z"
          fill="url(#sol-g)"
        />
      </svg>
    );
  }
  // Generic coin glyph used as a bullet marker. Brand-colored ring with a
  // simple central node so it reads as a coin without competing with BTC/ETH.
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6.4"
        fill="color-mix(in srgb, var(--color-brand) 16%, transparent)"
        stroke="var(--color-brand)"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="8" r="2" fill="var(--color-brand)" />
    </svg>
  );
}

function ParticleMesh() {
  const prefersReducedMotion = useReducedMotion();
  const { nodes, edges } = useMemo(buildMesh, []);
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // Drag bookkeeping. While an orbiter is being dragged, we *freeze* its
  // anchored position (so the dashed pendulum tether stays put and reads as
  // the rubber-band's anchor while the icon stretches away). On release we
  // shift the orbit's effective time so it resumes exactly from the
  // drag-start moment — the spring-back arrives at a position that's
  // continuous with the resumed orbit, no snap.
  const [draggingSymbol, setDraggingSymbol] =
    useState<OrbitingIcon["symbol"] | null>(null);
  const frozenPosRef = useRef<
    Partial<Record<OrbitingIcon["symbol"], { x: number; y: number }>>
  >({});
  const dragStartEffectiveTRef = useRef<
    Partial<Record<OrbitingIcon["symbol"], number>>
  >({});
  const timeOffsetRef = useRef<
    Partial<Record<OrbitingIcon["symbol"], number>>
  >({});

  useEffect(() => {
    if (prefersReducedMotion) return;
    let mounted = true;
    startRef.current = performance.now();
    const loop = (now: number) => {
      if (!mounted) return;
      setTick(now - startRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion]);

  const computeOrbital = (o: OrbitingIcon, t: number) => {
    const angle = o.baseAngle + t * o.speed;
    const wobbleR = Math.sin(t * 0.0011 + o.baseAngle * 3.1) * 5;
    const wobbleA = Math.cos(t * 0.0014 + o.baseAngle * 2.3) * 0.04;
    const radius = o.radius + wobbleR;
    return {
      x: MESH_CENTER.x + Math.cos(angle + wobbleA) * radius,
      y: MESH_CENTER.y + Math.sin(angle + wobbleA) * radius,
    };
  };

  // Polygon vertex → interior node connections. Pre-computed: pick each
  // vertex's POLYGON_NEAREST_COUNT closest interior nodes within
  // POLYGON_CONNECT_DIST so every polygon corner reaches a couple lines
  // inward. The polygon stops reading as a separate orbiting ring.
  const polygonConnections = useMemo(() => {
    return OUTER_RING_VERTICES.map((v) => {
      return nodes
        .map((n, ni) => ({ ni, d: Math.hypot(v.x - n.x, v.y - n.y) }))
        .filter((c) => c.d < POLYGON_CONNECT_DIST)
        .sort((a, b) => a.d - b.d)
        .slice(0, POLYGON_NEAREST_COUNT)
        .map((c) => c.ni);
    });
  }, [nodes]);

  const iconPositions = ORBITS.map((o) => {
    if (draggingSymbol === o.symbol && frozenPosRef.current[o.symbol]) {
      return { symbol: o.symbol, ...frozenPosRef.current[o.symbol]! };
    }
    const offset = timeOffsetRef.current[o.symbol] ?? 0;
    return { symbol: o.symbol, ...computeOrbital(o, tick + offset) };
  });

  const liveNodes = nodes.map((n) =>
    prefersReducedMotion
      ? n
      : {
          ...n,
          x: n.x + Math.sin(tick * 0.0009 + n.phase) * n.amp,
          y: n.y + Math.cos(tick * 0.0011 + n.phase) * n.amp,
        },
  );

  // Whole-mesh clockwise rotation. 0.006 deg/ms = 6 deg/sec, matching the
  // RadialOrbitalTimeline cadence used in "What I Bring" (0.3 deg per 50ms).
  // Rotation only spins the polygon + interior mesh group; the BTC/ETH/SOL
  // orbiters, their pendulum tethers, and the centroid stay independent.
  const meshRotation = prefersReducedMotion ? 0 : (tick * 0.006) % 360;

  const handleDragStart = (symbol: OrbitingIcon["symbol"]) => {
    const o = ORBITS.find((x) => x.symbol === symbol);
    if (!o) return;
    const offset = timeOffsetRef.current[symbol] ?? 0;
    const effectiveT = tick + offset;
    frozenPosRef.current[symbol] = computeOrbital(o, effectiveT);
    dragStartEffectiveTRef.current[symbol] = effectiveT;
    setDraggingSymbol(symbol);
  };

  const handleDragEnd = (symbol: OrbitingIcon["symbol"]) => {
    const dragStartT = dragStartEffectiveTRef.current[symbol] ?? tick;
    // Resume the orbit at the drag-start moment. tick + offset == dragStartT.
    timeOffsetRef.current[symbol] = dragStartT - tick;
    delete frozenPosRef.current[symbol];
    delete dragStartEffectiveTRef.current[symbol];
    setDraggingSymbol(null);
  };

  return (
    <div
      className="relative w-full"
      style={{
        aspectRatio: `${MESH_W} / ${MESH_H}`,
        maxWidth: MESH_W,
        marginLeft: "auto",
      }}
    >
      <svg
        viewBox={`0 0 ${MESH_W} ${MESH_H}`}
        width="100%"
        height="100%"
        style={{ overflow: "visible", display: "block" }}
        aria-hidden
      >
        <defs>
          {/* Halo: transparent inside the polygon, brightest just outside its
              edge, then fades to nothing. Inverts the previous inward glow. */}
          <radialGradient
            id="mesh-halo-glow"
            cx={MESH_CENTER.x}
            cy={MESH_CENTER.y}
            r="260"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="var(--color-brand)" stopOpacity="0" />
            <stop offset="0.62" stopColor="var(--color-brand)" stopOpacity="0" />
            <stop
              offset="0.74"
              stopColor="var(--color-brand)"
              stopOpacity="0.30"
            />
            <stop
              offset="0.90"
              stopColor="var(--color-brand)"
              stopOpacity="0.06"
            />
            <stop offset="1" stopColor="var(--color-brand)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="node-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.2" />
          </radialGradient>
          <filter id="mesh-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer halo (doughnut-shaped: clean inside polygon, bright outside) */}
        <rect
          x="-60"
          y="-60"
          width={MESH_W + 120}
          height={MESH_H + 120}
          fill="url(#mesh-halo-glow)"
        />

        {/* Rotating mesh group. Everything tied to the polygon's structural
            geometry — the inner fill, the polygon outline + vertex pads, the
            polygon→interior tendrils, the interior edges and nodes — rotates
            together as one rigid unit around MESH_CENTER. The icons, their
            pendulum tethers, and the orbit guides live outside this group so
            their motion stays independent. */}
        <g
          style={{
            transformOrigin: `${MESH_CENTER.x}px ${MESH_CENTER.y}px`,
            transform: `rotate(${meshRotation}deg)`,
          }}
        >
          {/* Soft inner fill so the polygon reads as a contained field */}
          <polygon
            points={OUTER_RING_POINTS}
            fill="color-mix(in srgb, var(--color-brand) 3%, transparent)"
            stroke="none"
          />

          {/* Polygon → interior connection edges. Pre-computed once; both
              endpoints sit in this rotating group, so the tendrils stay
              attached to their interior anchors as the mesh spins. */}
          <g>
            {polygonConnections.flatMap((nodeIdxs, vi) =>
              nodeIdxs.map((ni) => {
                const v = OUTER_RING_VERTICES[vi];
                const n = liveNodes[ni];
                return (
                  <line
                    key={`pe-${vi}-${ni}`}
                    x1={v.x}
                    y1={v.y}
                    x2={n.x}
                    y2={n.y}
                    stroke="var(--color-brand)"
                    strokeOpacity={0.30}
                    strokeWidth={0.7}
                  />
                );
              }),
            )}
          </g>

          {/* Polygon outline */}
          <polygon
            points={OUTER_RING_POINTS}
            fill="none"
            stroke="color-mix(in srgb, var(--color-brand) 60%, transparent)"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          {OUTER_RING_VERTICES.map((p, i) => (
            <circle
              key={`v-${i}`}
              cx={p.x}
              cy={p.y}
              r={2.6}
              fill="color-mix(in srgb, var(--color-brand) 88%, transparent)"
              style={{
                filter:
                  "drop-shadow(0 0 4px color-mix(in srgb, var(--color-brand) 70%, transparent))",
              }}
            />
          ))}

          {/* Interior mesh edges */}
          <g>
            {edges.map((e, i) => {
              const a = liveNodes[e.a];
              const b = liveNodes[e.b];
              const t = 1 - e.d / EDGE_DIST;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--color-brand)"
                  strokeOpacity={0.18 + t * 0.32}
                  strokeWidth={0.6}
                />
              );
            })}
          </g>

          {/* Interior mesh nodes */}
          <g filter="url(#mesh-glow)">
            {liveNodes.map((n, i) => (
              <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="url(#node-grad)" />
            ))}
          </g>
        </g>

        {/* Orbit guide rings */}
        {ORBITS.map((o, i) => (
          <circle
            key={`orbit-${i}`}
            cx={MESH_CENTER.x}
            cy={MESH_CENTER.y}
            r={o.radius}
            fill="none"
            stroke="var(--color-brand)"
            strokeOpacity={0.08}
            strokeDasharray="2 4"
          />
        ))}

        {/* Pendulum tethers from centroid to each orbiter's anchor. During a
            drag, the anchor is frozen, so the tether stays put while the icon
            visually stretches away from it via framer-motion's drag transform.
            On release, the icon springs back to the tether tip. */}
        {iconPositions.map((p, i) => (
          <line
            key={`pend-${i}`}
            x1={MESH_CENTER.x}
            y1={MESH_CENTER.y}
            x2={p.x}
            y2={p.y}
            stroke="var(--color-brand)"
            strokeOpacity={0.32}
            strokeWidth={0.9}
            strokeDasharray="3 3"
          />
        ))}

        {/* Centroid */}
        <circle
          cx={MESH_CENTER.x}
          cy={MESH_CENTER.y}
          r={4}
          fill="var(--color-brand)"
          style={{
            filter:
              "drop-shadow(0 0 6px color-mix(in srgb, var(--color-brand) 80%, transparent))",
          }}
        />
      </svg>

      {/* Orbiting icons (DOM). Each is draggable; release springs it back to
          its anchored pendulum tip via dragSnapToOrigin + bounce transition. */}
      {iconPositions.map((p) => (
        <CryptoOrbiter
          key={p.symbol}
          symbol={p.symbol}
          xPct={(p.x / MESH_W) * 100}
          yPct={(p.y / MESH_H) * 100}
          onDragStart={() => handleDragStart(p.symbol)}
          onDragEnd={() => handleDragEnd(p.symbol)}
        />
      ))}
    </div>
  );
}

function CryptoOrbiter({
  symbol,
  xPct,
  yPct,
  onDragStart,
  onDragEnd,
}: {
  symbol: OrbitingIcon["symbol"];
  xPct: number;
  yPct: number;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragMomentum={false}
      dragTransition={{
        // Bouncy spring back so the rubber-band/elastic feel lands clearly
        bounceStiffness: 220,
        bounceDamping: 14,
      }}
      dragElastic={0.6}
      onDragStart={() => {
        setDragging(true);
        onDragStart();
      }}
      onDragEnd={() => {
        setDragging(false);
        onDragEnd();
      }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.18 }}
      whileTap={prefersReducedMotion ? {} : { scale: 1.08 }}
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        // marginLeft/marginTop center the element on its anchor without
        // touching `transform` — leaving the transform property free for
        // framer-motion's drag offset to occupy.
        width: 40,
        height: 40,
        marginLeft: -20,
        marginTop: -20,
        borderRadius: "9999px",
        backgroundColor: "var(--color-surface)",
        border:
          "1.5px solid color-mix(in srgb, var(--color-brand) 55%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          hover || dragging
            ? "0 0 30px 6px color-mix(in srgb, var(--color-brand) 50%, transparent)"
            : "0 4px 16px color-mix(in srgb, var(--color-brand) 20%, transparent)",
        cursor: dragging ? "grabbing" : "grab",
        zIndex: dragging ? 4 : 3,
        userSelect: "none",
        touchAction: "none",
      }}
      aria-label={`Drag ${symbol}`}
    >
      <CryptoGlyph symbol={symbol} size={24} />
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Stat card. `value` may be a short number ("8+") or a multi-token list
// ("L1, L2, DeFi, RWA, DePIN, NFTs") — `compactValue` switches to a smaller,
// wrapping display so the longer string fits without breaking the grid.
// ----------------------------------------------------------------------------
function StatCard({
  value,
  label,
  caption,
  compactValue,
}: {
  value: string;
  label: string;
  caption: string;
  compactValue?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: hover ? "var(--color-brand)" : "var(--color-border)",
        boxShadow: hover ? "0 8px 24px var(--color-brand-light)" : "none",
        borderRadius: 12,
        transition:
          "border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        overflow: "hidden",
      }}
      className="border p-6 flex flex-col gap-1"
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          color: "var(--color-brand)",
          fontSize: compactValue ? 14 : 32,
          lineHeight: compactValue ? 1.25 : 1.05,
          // Coverage row should never wrap — keep "NFTs" on the same line as
          // the rest of the sector list.
          whiteSpace: compactValue ? "nowrap" : undefined,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-primary)",
          fontSize: 11,
          letterSpacing: "0.08em",
        }}
        className="uppercase"
      >
        {label}
      </div>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-muted)",
          fontSize: 13,
          lineHeight: 1.5,
        }}
        className="mt-2"
      >
        {caption}
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Specialty card — mirrors ProjectCard's hover language (brand border,
// brand-light box-shadow, -3px lift), but with two refinements:
//   - The title text itself glows on card hover via the global `titleGlow`
//     keyframe (text-shadow only — no rectangular box around the heading).
//   - Bullet markers are small coin glyphs. While the card is hovered, each
//     coin spins 360° around the Y axis on a continuous infinite loop with a
//     small per-bullet stagger, so the row reads as a DNA helix wave. Hover
//     out stops every coin.
// ----------------------------------------------------------------------------
const COIN_SPIN_MS = 1000;
const COIN_STAGGER_MS = 180;

function SpecialtyCard({
  title,
  bullets,
}: {
  title: string;
  bullets: string[];
}) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={prefersReducedMotion ? {} : { y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: hovered ? "var(--color-brand)" : "var(--color-border)",
        boxShadow: hovered ? "0 8px 24px var(--color-brand-light)" : "none",
        borderRadius: 12,
      }}
      className="group flex flex-col h-full p-6 border transition-[border-color,box-shadow] duration-200"
    >
      <h3
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          color: "var(--color-brand)",
          fontSize: 16,
        }}
        className="mb-4 shrink-0 group-hover:animate-[titleGlow_1.2s_ease-in-out_infinite_alternate]"
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {bullets.map((b, i) => (
          <li
            key={b}
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-secondary)",
              fontSize: 13,
              lineHeight: 1.55,
            }}
            className="flex items-start gap-2"
          >
            <span
              style={{
                display: "inline-flex",
                marginTop: 3,
                transformStyle: "preserve-3d",
                animation:
                  hovered && !prefersReducedMotion
                    ? `coinSpin ${COIN_SPIN_MS}ms linear ${
                        i * COIN_STAGGER_MS
                      }ms infinite`
                    : "none",
              }}
              aria-hidden
            >
              <CryptoGlyph symbol="GENERIC" size={14} />
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <style jsx>{`
        @keyframes coinSpin {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Featured-mentions marquee
// ----------------------------------------------------------------------------
const TWEET_CARD_W = 360;
const TWEET_GAP = 20;
const TWEET_SPEED_PX_SEC = 38;

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "now";
  const diff = Date.now() - then;
  const day = 86_400_000;
  if (diff < day) return "today";
  const d = Math.floor(diff / day);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo`;
  return `${Math.floor(d / 365)}y`;
}

function formatMetric(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function FeaturedTweetCard({ tweet }: { tweet: CryptoTweet }) {
  const [hover, setHover] = useState(false);
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: TWEET_CARD_W,
        flexShrink: 0,
        backgroundColor: "var(--color-surface)",
        borderRadius: 14,
        border: `1px solid ${
          hover
            ? "var(--color-brand)"
            : "color-mix(in srgb, var(--color-brand) 18%, var(--color-border))"
        }`,
        boxShadow: hover
          ? "0 14px 36px color-mix(in srgb, var(--color-brand) 22%, transparent)"
          : "0 6px 18px rgba(0,0,0,0.06)",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition:
          "border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          aria-hidden
          style={{
            width: 34,
            height: 34,
            borderRadius: "9999px",
            backgroundColor:
              "color-mix(in srgb, var(--color-brand) 12%, var(--color-surface-alt))",
            border:
              "1px solid color-mix(in srgb, var(--color-brand) 38%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            color: "var(--color-brand)",
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {tweet.author.slice(0, 1)}
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-primary)",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {tweet.author}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              fontSize: 11,
            }}
          >
            @{tweet.handle} &middot; {relTime(tweet.publishedAt)}
          </span>
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-secondary)",
          fontSize: 13.5,
          lineHeight: 1.55,
          margin: 0,
        }}
        className="line-clamp-5"
      >
        {tweet.content}
      </p>

      <div
        className="flex items-center gap-4 mt-auto"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
        }}
      >
        <span className="inline-flex items-center gap-1">
          <MessageCircle size={12} />
          {formatMetric(tweet.metrics.replies)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Repeat2 size={12} />
          {formatMetric(tweet.metrics.retweets)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Heart size={12} />
          {formatMetric(tweet.metrics.likes)}
        </span>
        <span
          style={{
            marginLeft: "auto",
            color: "var(--color-brand)",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.12em",
            border:
              "1px solid color-mix(in srgb, var(--color-brand) 38%, transparent)",
            borderRadius: 4,
            padding: "2px 6px",
          }}
          className="uppercase"
        >
          Mention
        </span>
      </div>
    </article>
  );
}

function FeaturedTweetMarquee({ tweets }: { tweets: CryptoTweet[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const oneSetWidth = tweets.length * (TWEET_CARD_W + TWEET_GAP);
  const durationSec = oneSetWidth / TWEET_SPEED_PX_SEC;

  if (prefersReducedMotion) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tweets.slice(0, 3).map((t) => (
          <FeaturedTweetCard key={t.id} tweet={t} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="crypto-marquee relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        overflow: "hidden",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 12%, black 88%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, black 12%, black 88%, transparent 100%)",
      }}
    >
      <div
        className="crypto-marquee-track"
        style={{
          display: "flex",
          gap: TWEET_GAP,
          width: "max-content",
          animation: `cryptoMarqueeScroll ${durationSec}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {tweets.map((t) => (
          <FeaturedTweetCard key={`a-${t.id}`} tweet={t} />
        ))}
        {tweets.map((t) => (
          <FeaturedTweetCard key={`b-${t.id}`} tweet={t} />
        ))}
      </div>

      <style jsx>{`
        @keyframes cryptoMarqueeScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-${oneSetWidth}px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .crypto-marquee-track {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Section
// ----------------------------------------------------------------------------
export function CryptoSection() {
  return (
    <section className="py-20 lg:py-28 overflow-x-clip">
      <div className="container">
        <div className="mb-10">
          <ScrollReveal variant="fadeUp">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
              className="text-3xl md:text-4xl"
            >
              {HEADING}
            </h2>
          </ScrollReveal>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-muted)",
            }}
            className="mt-3 text-base md:text-lg max-w-2xl"
          >
            {SUBTEXT}
          </p>
        </div>

        {/* Stats grid + particle mesh */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-14 items-center mb-16">
          <ScrollReveal variant="fadeUp">
            {/* Stats grid: 2-up below lg (full container width), 1-up at
                lg-xl (where the outer layout is half-half and the inner
                column is too narrow for the Coverage row), 2-up again at 2xl
                where there's room. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-4">
              {cryptoStats.map((s) => (
                <StatCard
                  key={s.label}
                  {...s}
                  compactValue={s.label === "Coverage"}
                />
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fadeIn" delay={0.15}>
            <ParticleMesh />
          </ScrollReveal>
        </div>

        {/* Specializations — no subhead; cards inherit "What I Build" hover language */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {cryptoSpecialties.map((sp) => (
            <motion.div
              key={sp.title}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="h-full"
            >
              <SpecialtyCard title={sp.title} bullets={sp.bullets} />
            </motion.div>
          ))}
        </motion.div>

        {/* Featured mentions marquee */}
        <div>
          <ScrollReveal variant="fadeUp">
            <div className="flex items-baseline justify-between mb-5 gap-4 flex-wrap">
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  fontSize: 20,
                }}
              >
                Featured Mentions
              </h3>
              <Link
                href={person.social.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-brand)",
                  fontFamily: "var(--font-sans)",
                }}
                className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all duration-150"
              >
                See the conversation
                <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>

          <FeaturedTweetMarquee tweets={cryptoTweets} />
        </div>
      </div>
    </section>
  );
}
