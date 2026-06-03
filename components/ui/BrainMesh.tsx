"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * BrainMesh
 *
 * Two coplanar polygon rings drawn around the SplineBrain in the hero.
 * Both rings live on the screen plane (no 3D tilt), rotating clockwise at
 * different angular speeds. Neither ring's vertices or edges cross the
 * brain's visible silhouette, and the rings stay clear of each other.
 * Spokes link each outer vertex back to a fixed partner on the inner ring,
 * so as the rings phase out of sync the spokes form a slow churning weave.
 *
 * Interactions:
 *   1. Drag a node: it stretches away from its rest position on the ring,
 *      driven by the pointer. Release and damped Hooke physics pulls it
 *      back along the moving rest position.
 *   2. Drag a polygon edge: that ring follows the pointer like a steering
 *      wheel. On release, the recent angular velocity becomes the ring's
 *      momentary spin speed and exponentially decays back to its baseline
 *      rotation. Spokes are not draggable (they belong to two rings).
 *
 * Pointer-events are scoped to the per-node hit circles and the per-edge
 * hit lines, so the SplineBrain underneath still receives orbit-control
 * gestures everywhere else.
 */

const INNER_COUNT = 6;
const OUTER_COUNT = 12;

// rad/s, positive = clockwise in SVG (y-down) coordinates.
const INNER_ROTATION = 0.12;
const OUTER_ROTATION = 0.05;

// Ring radii as a fraction of min(w, h). Outer is capped under 0.5 so the
// ring (plus its nodes) always fits inside the hero column horizontally;
// inner is pulled in just enough to clear the brain silhouette while
// leaving a clear gap between the two rings.
const INNER_RADIUS_FACTOR = 0.36;
const OUTER_RADIUS_FACTOR = 0.46;

const SPRING_K = 240;
const SPRING_DAMPING = 22;
const NODE_R = 4.2;
const HIT_R = 14;

// Fat invisible band along each polygon edge for grabbing. 16px is wide
// enough to catch a fingertip on touch without crowding the brain canvas.
const EDGE_HIT_WIDTH = 16;

// How quickly a ring's perturbed angular velocity relaxes back to its
// baseline after a fling. Higher = snappier return. 1.6/s settles in
// roughly 2 seconds for typical fling magnitudes.
const ANG_VEL_DECAY = 1.6;

// Cap on the angular velocity a single fling can impart, so a violent
// drag does not send the ring into a long uncontrolled spin.
const MAX_FLING_ANG_VEL = 8;

interface V2 { x: number; y: number; }

type RingId = "inner" | "outer";
type EdgeKind = RingId | "spoke";
interface NodeSpec { ring: RingId; baseAngle: number; }
interface EdgeSpec { a: number; b: number; kind: EdgeKind; }

interface EdgeDragState {
  ring: RingId;
  pointerId: number;
  lastAngle: number;     // pointer angle relative to ring center, last sample
  lastT: number;         // last sample time (ms, DOMHighResTimeStamp)
  recentAngVel: number;  // most recent angular velocity in rad/s
}

interface BrainMeshProps {
  className?: string;
}

export function BrainMesh({ className }: BrainMeshProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Geometry is constant. Inner ring first, then outer, so node indices
  // partition cleanly. The outer ring is offset by half a sector so its
  // vertices sit between inner ones at t = 0; the silhouette reads more
  // interesting than radially aligned vertices.
  const { nodes, edges } = useMemo(() => {
    const list: NodeSpec[] = [];
    for (let i = 0; i < INNER_COUNT; i++) {
      list.push({
        ring: "inner",
        baseAngle: (i / INNER_COUNT) * Math.PI * 2,
      });
    }
    const outerOffset = (Math.PI * 2) / OUTER_COUNT / 2;
    for (let j = 0; j < OUTER_COUNT; j++) {
      list.push({
        ring: "outer",
        baseAngle: (j / OUTER_COUNT) * Math.PI * 2 + outerOffset,
      });
    }

    const innerStart = 0;
    const outerStart = INNER_COUNT;
    const e: EdgeSpec[] = [];

    for (let i = 0; i < INNER_COUNT; i++) {
      e.push({
        a: innerStart + i,
        b: innerStart + ((i + 1) % INNER_COUNT),
        kind: "inner",
      });
    }
    for (let j = 0; j < OUTER_COUNT; j++) {
      e.push({
        a: outerStart + j,
        b: outerStart + ((j + 1) % OUTER_COUNT),
        kind: "outer",
      });
    }
    // Spokes: each outer vertex partners with the inner vertex at its
    // proportional angular slot. With OUTER_COUNT = 2 * INNER_COUNT every
    // inner vertex gets exactly two spokes.
    for (let j = 0; j < OUTER_COUNT; j++) {
      const partner = Math.floor((j * INNER_COUNT) / OUTER_COUNT);
      e.push({ a: outerStart + j, b: innerStart + partner, kind: "spoke" });
    }
    return { nodes: list, edges: e };
  }, []);

  const offsetsRef = useRef<V2[]>(nodes.map(() => ({ x: 0, y: 0 })));
  const velocitiesRef = useRef<V2[]>(nodes.map(() => ({ x: 0, y: 0 })));
  const yawInnerRef = useRef(0);
  const yawOuterRef = useRef(0);
  // Current angular velocity per ring. Defaults to the baseline; an edge
  // fling overwrites it, then ANG_VEL_DECAY pulls it back to baseline.
  const angVelInnerRef = useRef(INNER_ROTATION);
  const angVelOuterRef = useRef(OUTER_ROTATION);
  const nodeDragRef = useRef<{ nodeIdx: number; pointerId: number } | null>(null);
  const edgeDragRef = useRef<EdgeDragState | null>(null);
  const reducedRef = useRef(false);
  const [, forceRender] = useState(0);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Main RAF loop:
  //   1. advance both ring yaws by their current angular velocity, and
  //      relax that velocity back to baseline (skipped while an edge drag
  //      is actively steering, since the handler updates yaw directly).
  //   2. integrate spring physics on every node offset.
  //   3. trigger React render.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!reducedRef.current && !edgeDragRef.current) {
        yawInnerRef.current =
          (yawInnerRef.current + angVelInnerRef.current * dt) % (Math.PI * 2);
        yawOuterRef.current =
          (yawOuterRef.current + angVelOuterRef.current * dt) % (Math.PI * 2);
        // Exponential pull back to baseline rotation.
        angVelInnerRef.current +=
          (INNER_ROTATION - angVelInnerRef.current) * ANG_VEL_DECAY * dt;
        angVelOuterRef.current +=
          (OUTER_ROTATION - angVelOuterRef.current) * ANG_VEL_DECAY * dt;
      }

      const offsets = offsetsRef.current;
      const velocities = velocitiesRef.current;
      const drag = nodeDragRef.current;
      for (let i = 0; i < offsets.length; i++) {
        if (drag && drag.nodeIdx === i) continue;
        const o = offsets[i];
        const v = velocities[i];
        const ax = -SPRING_K * o.x - SPRING_DAMPING * v.x;
        const ay = -SPRING_K * o.y - SPRING_DAMPING * v.y;
        v.x += ax * dt;
        v.y += ay * dt;
        o.x += v.x * dt;
        o.y += v.y * dt;
      }

      forceRender((t) => (t + 1) & 0xffff);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const radiusFor = (ring: RingId, minDim: number) =>
    minDim *
    (ring === "inner" ? INNER_RADIUS_FACTOR : OUTER_RADIUS_FACTOR);
  const yawFor = (ring: RingId) =>
    ring === "inner" ? yawInnerRef.current : yawOuterRef.current;

  const computeRestScreen = (nodeIdx: number, rect: DOMRect) => {
    const n = nodes[nodeIdx];
    const r = radiusFor(n.ring, Math.min(rect.width, rect.height));
    const a = n.baseAngle + yawFor(n.ring);
    return {
      x: rect.width / 2 + Math.cos(a) * r,
      y: rect.height / 2 + Math.sin(a) * r,
    };
  };

  // ── Node drag handlers ────────────────────────────────────────────────
  const handleNodePointerDown = (
    e: React.PointerEvent<SVGCircleElement>,
    nodeIdx: number,
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    nodeDragRef.current = { nodeIdx, pointerId: e.pointerId };
  };

  const handleNodePointerMove = (e: React.PointerEvent<SVGCircleElement>) => {
    const drag = nodeDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const restScreen = computeRestScreen(drag.nodeIdx, rect);
    const target = { x: px - restScreen.x, y: py - restScreen.y };
    const offset = offsetsRef.current[drag.nodeIdx];
    const velocity = velocitiesRef.current[drag.nodeIdx];
    // Synthesize velocity from offset delta so release flicks register as
    // momentum.
    velocity.x = (target.x - offset.x) * 60;
    velocity.y = (target.y - offset.y) * 60;
    offset.x = target.x;
    offset.y = target.y;
  };

  const handleNodePointerUp = (e: React.PointerEvent<SVGCircleElement>) => {
    if (nodeDragRef.current?.pointerId === e.pointerId) {
      nodeDragRef.current = null;
    }
  };

  // ── Edge drag handlers ────────────────────────────────────────────────
  const angleFromCenter = (px: number, py: number, rect: DOMRect) =>
    Math.atan2(py - rect.height / 2, px - rect.width / 2);

  const handleEdgePointerDown = (
    e: React.PointerEvent<SVGLineElement>,
    ring: RingId,
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    edgeDragRef.current = {
      ring,
      pointerId: e.pointerId,
      lastAngle: angleFromCenter(
        e.clientX - rect.left,
        e.clientY - rect.top,
        rect,
      ),
      lastT: e.timeStamp,
      recentAngVel: 0,
    };
  };

  const handleEdgePointerMove = (e: React.PointerEvent<SVGLineElement>) => {
    const drag = edgeDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const newAngle = angleFromCenter(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect,
    );
    let dAngle = newAngle - drag.lastAngle;
    // Unwrap the ±π discontinuity so dragging across the +x axis still
    // produces a small signed delta.
    if (dAngle > Math.PI) dAngle -= Math.PI * 2;
    else if (dAngle < -Math.PI) dAngle += Math.PI * 2;
    const dtMs = Math.max(1, e.timeStamp - drag.lastT);
    const angVel = (dAngle / dtMs) * 1000; // rad/s

    if (drag.ring === "inner") {
      yawInnerRef.current = yawInnerRef.current + dAngle;
    } else {
      yawOuterRef.current = yawOuterRef.current + dAngle;
    }
    drag.lastAngle = newAngle;
    drag.lastT = e.timeStamp;
    drag.recentAngVel = angVel;
  };

  const handleEdgePointerUp = (e: React.PointerEvent<SVGLineElement>) => {
    const drag = edgeDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const v = Math.max(
      -MAX_FLING_ANG_VEL,
      Math.min(MAX_FLING_ANG_VEL, drag.recentAngVel),
    );
    if (drag.ring === "inner") angVelInnerRef.current = v;
    else angVelOuterRef.current = v;
    edgeDragRef.current = null;
  };

  // ── Render ────────────────────────────────────────────────────────────
  const { w, h } = size;
  if (w === 0 || h === 0) {
    return <div ref={rootRef} className={className} />;
  }

  const cx = w / 2;
  const cy = h / 2;
  const minDim = Math.min(w, h);

  const projected = nodes.map((n, i) => {
    const r = radiusFor(n.ring, minDim);
    const a = n.baseAngle + yawFor(n.ring);
    const offset = offsetsRef.current[i] ?? { x: 0, y: 0 };
    return {
      x: cx + Math.cos(a) * r + offset.x,
      y: cy + Math.sin(a) * r + offset.y,
      ring: n.ring,
    };
  });

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ pointerEvents: "none", position: "absolute", inset: 0 }}
      aria-hidden
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {edges.map(({ a, b, kind }, i) => {
          const pa = projected[a];
          const pb = projected[b];
          const isSpoke = kind === "spoke";
          const alpha = isSpoke ? 22 : 38;
          return (
            <line
              key={`edge-${i}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={`color-mix(in srgb, var(--color-text-muted) ${alpha}%, transparent)`}
              strokeWidth={1}
              pointerEvents="none"
            />
          );
        })}

        {/* Polygon-edge hit lines. Spokes span two rings rotating at
            different speeds, so a single angular fling on them would be
            ambiguous; they are intentionally inert. */}
        {edges.map(({ a, b, kind }, i) => {
          if (kind === "spoke") return null;
          const pa = projected[a];
          const pb = projected[b];
          const ring = kind as RingId;
          const dragging = edgeDragRef.current?.ring === ring;
          return (
            <line
              key={`hit-edge-${i}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke="transparent"
              strokeWidth={EDGE_HIT_WIDTH}
              strokeLinecap="round"
              style={{
                pointerEvents: "stroke",
                cursor: dragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
              onPointerDown={(e) => handleEdgePointerDown(e, ring)}
              onPointerMove={handleEdgePointerMove}
              onPointerUp={handleEdgePointerUp}
              onPointerCancel={handleEdgePointerUp}
            />
          );
        })}

        {projected.map((p, i) => {
          const dragged = nodeDragRef.current?.nodeIdx === i;
          const sizeFactor = p.ring === "inner" ? 1.0 : 0.85;
          const r = NODE_R * sizeFactor + (dragged ? 1.6 : 0);
          const fillAlpha = p.ring === "inner" ? 65 : 52;
          const fill = dragged
            ? "var(--color-brand)"
            : `color-mix(in srgb, var(--color-text-primary) ${fillAlpha}%, transparent)`;
          const filter = dragged
            ? "drop-shadow(0 0 10px var(--color-brand))"
            : undefined;
          return (
            <g key={`node-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={fill}
                style={{
                  transition: "fill 200ms ease",
                  filter,
                  pointerEvents: "none",
                }}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={HIT_R}
                fill="transparent"
                style={{
                  pointerEvents: "auto",
                  cursor: dragged ? "grabbing" : "grab",
                  touchAction: "none",
                }}
                onPointerDown={(e) => handleNodePointerDown(e, i)}
                onPointerMove={handleNodePointerMove}
                onPointerUp={handleNodePointerUp}
                onPointerCancel={handleNodePointerUp}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
