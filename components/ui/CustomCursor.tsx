"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchOnly = window.matchMedia("(hover: none)").matches;
    if (reducedMotion || touchOnly) return;

    setActive(true);
    document.body.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      const el = cursorRef.current;
      if (!el) return;
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    };

    const onOver = (e: MouseEvent) => {
      const el = cursorRef.current;
      if (!el) return;
      const hit = !!(e.target as Element).closest(INTERACTIVE);
      el.style.transform = hit
        ? "translate(-50%, -50%) scale(1.5)"
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
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 32,
        height: 32,
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-50%, -50%) scale(1)",
        transition: "transform 200ms ease",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left ear */}
        <polygon points="4,0 0,9 9,9" fill="var(--color-brand)" />
        {/* Right ear */}
        <polygon points="28,0 23,9 32,9" fill="var(--color-brand)" />
        {/* Left eye */}
        <circle cx="11" cy="16" r="2" fill="var(--color-brand)" />
        {/* Right eye */}
        <circle cx="21" cy="16" r="2" fill="var(--color-brand)" />
        {/* Nose */}
        <polygon points="14,20 18,20 16,23" fill="var(--color-brand)" />
        {/* Left whiskers */}
        <line x1="0" y1="15" x2="9" y2="17" stroke="var(--color-brand)" strokeWidth="0.8" />
        <line x1="0" y1="18" x2="9" y2="18.5" stroke="var(--color-brand)" strokeWidth="0.8" />
        <line x1="0" y1="21" x2="9" y2="21" stroke="var(--color-brand)" strokeWidth="0.8" />
        {/* Right whiskers */}
        <line x1="32" y1="15" x2="23" y2="17" stroke="var(--color-brand)" strokeWidth="0.8" />
        <line x1="32" y1="18" x2="23" y2="18.5" stroke="var(--color-brand)" strokeWidth="0.8" />
        <line x1="32" y1="21" x2="23" y2="21" stroke="var(--color-brand)" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
