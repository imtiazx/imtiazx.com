"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchOnly   = window.matchMedia("(hover: none)").matches;
    if (reducedMotion || touchOnly) return;

    setActive(true);
    document.body.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      const el = dotRef.current;
      if (!el) return;
      el.style.left = `${e.clientX}px`;
      el.style.top  = `${e.clientY}px`;
    };

    const onOver = (e: MouseEvent) => {
      const el = dotRef.current;
      if (!el) return;
      const hit = !!(e.target as Element).closest(INTERACTIVE);
      el.style.transform = hit
        ? "translate(-50%, -50%) scale(1.8)"
        : "translate(-50%, -50%) scale(1)";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.body.style.cursor = "";
    };
  }, []);

  if (!active) return null;

  return (
    <div
      ref={dotRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: "var(--color-brand)",
        boxShadow: "0 0 8px var(--color-brand), 0 0 16px rgba(234, 88, 12, 0.4)",
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-50%, -50%) scale(1)",
        transition: "transform 150ms ease",
      }}
    />
  );
}
