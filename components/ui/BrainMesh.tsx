"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * BrainMesh
 *
 * Regular icosahedron wireframe (12 vertices, 30 edges, 5 edges per vertex)
 * that sits over the SplineBrain in the hero. Yaws clockwise around the Y
 * axis with a fixed X tilt so the rotation reads as a slow 3D spin. Each
 * node carries an independent spring offset — drag a node and it stretches
 * away from its rest position; release and damped Hooke physics pulls it
 * back.
 *
 * Pointer-events are scoped to the per-node hit circles only, so the
 * SplineBrain underneath still receives orbit-control gestures everywhere
 * else.
 */

const ROTATION_SPEED = 0.18;     // rad/s yaw
const TILT_X = 0.32;             // static lean so the spin reads 3D
const MESH_FACTOR = 0.48;        // sphere radius as a fraction of min(w, h).
                                 // Sized so the equator lands outside the
                                 // brain's visible silhouette in the hero
                                 // column.
const SPRING_K = 240;            // Hooke stiffness
const SPRING_DAMPING = 22;       // damping coefficient
const NODE_R = 4.2;
const HIT_R = 14;                // generous tap target; transparent

interface Vec3 { x: number; y: number; z: number; }
interface V2 { x: number; y: number; }

/**
 * Regular icosahedron with vertices on the unit sphere. 12 vertices, 30
 * edges; every vertex has exactly 5 incident edges. The edge list is built
 * by selecting all vertex pairs whose pairwise distance matches the minimum
 * (the icosahedron's edge length).
 */
function icosahedron(): { vertices: Vec3[]; edges: [number, number][] } {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw: [number, number, number][] = [
    [ 0,  1,  phi], [ 0,  1, -phi],
    [ 0, -1,  phi], [ 0, -1, -phi],
    [ 1,  phi,  0], [ 1, -phi,  0],
    [-1,  phi,  0], [-1, -phi,  0],
    [ phi,  0,  1], [ phi,  0, -1],
    [-phi,  0,  1], [-phi,  0, -1],
  ];
  const norm = Math.sqrt(1 + phi * phi);
  const vertices: Vec3[] = raw.map(([x, y, z]) => ({
    x: x / norm,
    y: y / norm,
    z: z / norm,
  }));

  let minDist = Infinity;
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i].x - vertices[j].x;
      const dy = vertices[i].y - vertices[j].y;
      const dz = vertices[i].z - vertices[j].z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < minDist) minDist = d;
    }
  }

  const EPS = 1e-3;
  const edges: [number, number][] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dx = vertices[i].x - vertices[j].x;
      const dy = vertices[i].y - vertices[j].y;
      const dz = vertices[i].z - vertices[j].z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (Math.abs(d - minDist) < EPS) edges.push([i, j]);
    }
  }
  return { vertices, edges };
}

function rotateY(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}
function rotateX(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

interface BrainMeshProps {
  className?: string;
}

export function BrainMesh({ className }: BrainMeshProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Geometry is constant — build it once at module load via useMemo so we
  // don't redo the O(n²) edge search on every render.
  const { vertices: rest, edges } = useMemo(() => icosahedron(), []);

  const offsetsRef = useRef<V2[]>(rest.map(() => ({ x: 0, y: 0 })));
  const velocitiesRef = useRef<V2[]>(rest.map(() => ({ x: 0, y: 0 })));
  const yawRef = useRef(0);
  const dragRef = useRef<{ nodeIdx: number; pointerId: number } | null>(null);
  const reducedRef = useRef(false);
  // Tick state forces a re-render per RAF frame. With 12 nodes + 30 edges
  // the reconciliation is cheap; direct DOM attribute writes would be
  // faster but aren't worth the ugliness at this scale.
  const [, forceRender] = useState(0);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  // Resize tracking — drives the sphere screen radius.
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

  // Main RAF loop. Steps:
  //  1. advance yaw (unless dragging or reduced motion)
  //  2. integrate spring physics on each node's offset
  //  3. trigger React render
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp tab-blur jumps
      last = now;

      if (!dragRef.current && !reducedRef.current) {
        yawRef.current = (yawRef.current + ROTATION_SPEED * dt) % (Math.PI * 2);
      }

      const offsets = offsetsRef.current;
      const velocities = velocitiesRef.current;
      const drag = dragRef.current;
      for (let i = 0; i < offsets.length; i++) {
        if (drag && drag.nodeIdx === i) continue; // dragged node is driven by pointer
        const o = offsets[i];
        const v = velocities[i];
        // Damped harmonic oscillator: a = -k*x - c*v
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

  // ── Pointer / drag handlers ────────────────────────────────────────────
  // setPointerCapture on the hit circle so pointermove/up keep routing back
  // to it even when the pointer drifts off the visible area.

  const computeRestScreen = (nodeIdx: number, rect: DOMRect) => {
    const p = rest[nodeIdx];
    const yawed = rotateY(p, yawRef.current);
    const tilted = rotateX(yawed, TILT_X);
    const R = Math.min(rect.width, rect.height) * MESH_FACTOR;
    return {
      x: rect.width / 2 + tilted.x * R,
      y: rect.height / 2 + tilted.y * R,
    };
  };

  const handlePointerDown = (
    e: React.PointerEvent<SVGCircleElement>,
    nodeIdx: number,
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { nodeIdx, pointerId: e.pointerId };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGCircleElement>) => {
    const drag = dragRef.current;
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
    // momentum. Assumes ~60fps; if the actual rate differs the spring
    // damps it out in a few extra frames.
    velocity.x = (target.x - offset.x) * 60;
    velocity.y = (target.y - offset.y) * 60;
    offset.x = target.x;
    offset.y = target.y;
  };

  const handlePointerUp = (e: React.PointerEvent<SVGCircleElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  const { w, h } = size;
  if (w === 0 || h === 0) {
    return <div ref={rootRef} className={className} />;
  }

  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * MESH_FACTOR;
  const yaw = yawRef.current;

  // Project each node: yaw around Y, tilt around X, keep z for depth cues.
  const projected = rest.map((p, i) => {
    const yawed = rotateY(p, yaw);
    const tilted = rotateX(yawed, TILT_X);
    const offset = offsetsRef.current[i] ?? { x: 0, y: 0 };
    return {
      x: cx + tilted.x * R + offset.x,
      y: cy + tilted.y * R + offset.y,
      z: tilted.z, // -1 (back) .. +1 (front)
    };
  });

  // Render nodes back-to-front so front faces overlap the back.
  const renderOrder = projected
    .map((p, i) => ({ i, z: p.z }))
    .sort((a, b) => a.z - b.z)
    .map((o) => o.i);

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
        {/* Edges — drawn first so nodes sit on top. Opacity tracks the edge's
            average z so back edges read slightly fainter, giving the wireframe
            its depth. */}
        {edges.map(([a, b], i) => {
          const pa = projected[a];
          const pb = projected[b];
          const avgZ = (pa.z + pb.z) / 2;
          const depthAlpha = 0.20 + ((avgZ + 1) / 2) * 0.30;
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={`color-mix(in srgb, var(--color-text-muted) ${Math.round(
                depthAlpha * 100,
              )}%, transparent)`}
              strokeWidth={1}
            />
          );
        })}

        {/* Nodes — depth-sorted, with generous transparent hit targets. */}
        {renderOrder.map((i) => {
          const p = projected[i];
          const dragged = dragRef.current?.nodeIdx === i;
          // Back face slightly smaller + dimmer for a parallax cue.
          const depthFactor = 0.7 + ((p.z + 1) / 2) * 0.55;
          const r = NODE_R * depthFactor + (dragged ? 1.6 : 0);
          const fill = dragged
            ? "var(--color-brand)"
            : `color-mix(in srgb, var(--color-text-primary) ${Math.round(
                45 + depthFactor * 30,
              )}%, transparent)`;
          const filter = dragged
            ? "drop-shadow(0 0 10px var(--color-brand))"
            : undefined;
          return (
            <g key={i}>
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
              {/* Invisible hit target — large enough to grab comfortably. */}
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
                onPointerDown={(e) => handlePointerDown(e, i)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
