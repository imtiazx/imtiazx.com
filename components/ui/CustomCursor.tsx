"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

// Elements that make the laser bloom intensify on hover.
const INTERACTIVE_SELECTOR = "a, button, [role='button'], input";

// Box-shadow strings: same visual as the previous two filter:blur() rings,
// but rendered by the GPU as a stamped shadow instead of a live blur filter.
// Roughly 10x cheaper per frame.
const GLOW_IDLE =
  "0 0 8px 2px color-mix(in srgb, var(--color-brand) 25%, transparent), 0 0 18px 6px color-mix(in srgb, var(--color-brand) 10%, transparent)";
const GLOW_HOT =
  "0 0 12px 3px color-mix(in srgb, var(--color-brand) 45%, transparent), 0 0 26px 10px color-mix(in srgb, var(--color-brand) 22%, transparent)";

export function CustomCursor() {
  const dotWrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Pass 1: decide eligibility on the client. Touch / coarse pointers keep the
  // native cursor; everyone else gets the laser.
  useEffect(() => {
    const touchOnly = window.matchMedia("(hover: none)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (touchOnly || coarse) return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dotWrap = dotWrapRef.current;
    const dot = dotRef.current;
    if (!dotWrap || !dot) return;

    document.body.style.cursor = "none";

    // Reduced motion: a single static dot that snaps to the cursor. No glow,
    // no GSAP, no easing.
    if (reduced) {
      const onMove = (e: MouseEvent) => {
        dotWrap.style.opacity = "1";
        dotWrap.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      };
      window.addEventListener("mousemove", onMove);
      return () => {
        window.removeEventListener("mousemove", onMove);
        document.body.style.cursor = "";
      };
    }

    // Full laser pointer. One element (the dot) carries both the orange
    // center and its surrounding glow via box-shadow — no filter:blur layers.
    const dotX = gsap.quickTo(dotWrap, "x", { duration: 0.08, ease: "power3" });
    const dotY = gsap.quickTo(dotWrap, "y", { duration: 0.08, ease: "power3" });

    let isInteractive = false;
    const applyInteractive = (next: boolean) => {
      if (next === isInteractive) return;
      isInteractive = next;
      dot.style.transform = next ? "scale(1.5)" : "scale(1)";
      dot.style.boxShadow = next ? GLOW_HOT : GLOW_IDLE;
    };

    const onMove = (e: MouseEvent) => {
      dotWrap.style.opacity = "1";
      dotX(e.clientX);
      dotY(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      applyInteractive(!!target.closest(INTERACTIVE_SELECTOR));
    };
    const onLeaveDoc = () => {
      dotWrap.style.opacity = "0";
    };
    const onEnterDoc = () => {
      dotWrap.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeaveDoc);
    document.addEventListener("mouseenter", onEnterDoc);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeaveDoc);
      document.removeEventListener("mouseenter", onEnterDoc);
      document.body.style.cursor = "";
    };
  }, [enabled, reduced]);

  if (!enabled) return null;

  // The wrap is a 0x0 point GSAP translates to the cursor; the dot is
  // centered on it with negative margins. Start hidden so there is no flash
  // at the top-left corner before the first mousemove.
  const wrapStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    opacity: 0,
    pointerEvents: "none",
    width: 0,
    height: 0,
    zIndex: 9999,
    transition: reduced ? "none" : "opacity 200ms ease",
  };

  return (
    <div ref={dotWrapRef} style={wrapStyle}>
      <div
        ref={dotRef}
        style={{
          width: 8,
          height: 8,
          marginLeft: -4,
          marginTop: -4,
          borderRadius: "50%",
          background: "var(--color-brand)",
          transformOrigin: "center",
          transform: "scale(1)",
          boxShadow: reduced ? "none" : GLOW_IDLE,
          transition: reduced
            ? "none"
            : "transform 0.15s ease, box-shadow 0.18s ease",
        }}
      />
    </div>
  );
}
