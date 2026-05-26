"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

// Elements that make the laser bloom intensify on hover.
const INTERACTIVE_SELECTOR = "a, button, [role='button'], input";

export function CustomCursor() {
  const glowWrapRef = useRef<HTMLDivElement>(null);
  const dotWrapRef = useRef<HTMLDivElement>(null);
  const innerGlowRef = useRef<HTMLDivElement>(null);
  const outerGlowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Pass 1: decide eligibility on the client. Touch / coarse pointers keep the
  // native cursor; everyone else gets the laser. Stored in state so the cursor
  // elements render before pass 2 wires up their refs (the previous version
  // gated rendering behind a flag that was only set after a ref-null guard, so
  // it never actually activated).
  useEffect(() => {
    const touchOnly = window.matchMedia("(hover: none)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (touchOnly || coarse) return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setEnabled(true);
  }, []);

  // Pass 2: wire movement + hover once the elements exist. The mousemove
  // listener is a plain DOM listener (no gsap.context) and is removed in the
  // cleanup return, per the CLAUDE.md pattern.
  useEffect(() => {
    if (!enabled) return;
    const glowWrap = glowWrapRef.current;
    const dotWrap = dotWrapRef.current;
    const innerGlow = innerGlowRef.current;
    const outerGlow = outerGlowRef.current;
    const dot = dotRef.current;
    if (!dotWrap || !dot) return;

    document.body.style.cursor = "none";

    // --- Reduced motion: a single static dot that snaps to the cursor. ---
    // No glow, no GSAP, no easing (transition: none on the dot below).
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

    // --- Full laser pointer. ---
    // Dot is snappy (0.08); the glow trails a touch (0.18) so the bloom lags
    // the dot like a real laser smear on a surface.
    const dotX = gsap.quickTo(dotWrap, "x", { duration: 0.08, ease: "power3" });
    const dotY = gsap.quickTo(dotWrap, "y", { duration: 0.08, ease: "power3" });
    const glowX = gsap.quickTo(glowWrap, "x", { duration: 0.18, ease: "power3" });
    const glowY = gsap.quickTo(glowWrap, "y", { duration: 0.18, ease: "power3" });

    let isInteractive = false;
    const applyInteractive = (next: boolean) => {
      if (next === isInteractive) return;
      isInteractive = next;
      // Dot grows 8px -> 12px (scale 1.5); the bloom intensifies. Pure orange,
      // no mix-blend-mode.
      dot.style.transform = next ? "scale(1.5)" : "scale(1)";
      if (innerGlow) innerGlow.style.opacity = next ? "0.4" : "0.25";
      if (outerGlow) outerGlow.style.opacity = next ? "0.2" : "0.1";
    };

    const onMove = (e: MouseEvent) => {
      dotWrap.style.opacity = "1";
      if (glowWrap) glowWrap.style.opacity = "1";
      dotX(e.clientX);
      dotY(e.clientY);
      glowX(e.clientX);
      glowY(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      applyInteractive(!!target.closest(INTERACTIVE_SELECTOR));
    };
    const onLeaveDoc = () => {
      dotWrap.style.opacity = "0";
      if (glowWrap) glowWrap.style.opacity = "0";
    };
    const onEnterDoc = () => {
      dotWrap.style.opacity = "1";
      if (glowWrap) glowWrap.style.opacity = "1";
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

  // Each wrap is a 0x0 point GSAP translates to the cursor; inner elements are
  // centered on it with negative margins. Start hidden so there is no flash at
  // the top-left corner before the first mousemove.
  const wrapStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    opacity: 0,
    pointerEvents: "none",
    width: 0,
    height: 0,
    willChange: "transform",
    transition: reduced ? "none" : "opacity 200ms ease",
  };

  const glowCircle = (
    size: number,
    opacity: number,
    blur: number,
  ): React.CSSProperties => ({
    position: "absolute",
    width: size,
    height: size,
    marginLeft: -size / 2,
    marginTop: -size / 2,
    borderRadius: "50%",
    background: "var(--color-brand)",
    opacity,
    filter: `blur(${blur}px)`,
    transition: "opacity 0.18s ease",
    willChange: "opacity",
  });

  return (
    <>
      {!reduced && (
        <div ref={glowWrapRef} style={{ ...wrapStyle, zIndex: 9998 }}>
          {/* Soft radial bloom: outer 28px @ 0.10, inner 16px @ 0.25. */}
          <div ref={outerGlowRef} style={glowCircle(28, 0.1, 4)} />
          <div ref={innerGlowRef} style={glowCircle(16, 0.25, 2)} />
        </div>
      )}
      <div ref={dotWrapRef} style={{ ...wrapStyle, zIndex: 9999 }}>
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
            transition: reduced ? "none" : "transform 0.15s ease",
            willChange: "transform",
          }}
        />
      </div>
    </>
  );
}
