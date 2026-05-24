"use client";

import { useRef } from "react";

/**
 * OrangeHole -- pure CSS radial gradient + rotating ring that evokes a
 * blackhole/vortex peeking from above the hero horizon. Positioned absolute
 * inside the Hero wrapper, sits behind the text content (z-index 0).
 * No video, no Three.js, no canvas.
 */
export function OrangeHole() {
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "-80px",
        left: 0,
        right: 0,
        height: "480px",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div className="orangehole-ring" />
      <div className="orangehole-halo" />
      <div className="orangehole-void" />
    </div>
  );
}
