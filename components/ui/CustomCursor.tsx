"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, select, textarea, label, .interactive";

export function CustomCursor() {
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const dotWrapRef = useRef<HTMLDivElement>(null);
  const ringInnerRef = useRef<HTMLDivElement>(null);
  const dotInnerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchOnly = window.matchMedia("(hover: none)").matches;
    const coarse    = window.matchMedia("(pointer: coarse)").matches;
    if (reducedMotion || touchOnly || coarse) return;

    const ringWrap  = ringWrapRef.current;
    const dotWrap   = dotWrapRef.current;
    const ringInner = ringInnerRef.current;
    const dotInner  = dotInnerRef.current;
    if (!ringWrap || !dotWrap || !ringInner || !dotInner) return;

    setActive(true);
    document.body.style.cursor = "none";

    const ringX = gsap.quickTo(ringWrap, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(ringWrap, "y", { duration: 0.5, ease: "power3" });
    const dotX  = gsap.quickTo(dotWrap,  "x", { duration: 0.1, ease: "power3" });
    const dotY  = gsap.quickTo(dotWrap,  "y", { duration: 0.1, ease: "power3" });

    let isInteractive = false;

    const applyInteractive = (next: boolean) => {
      if (next === isInteractive) return;
      isInteractive = next;
      if (next) {
        ringInner.style.transform = "scale(1.5)";
        ringInner.style.opacity = "0.9";
      } else {
        ringInner.style.transform = "scale(1)";
        ringInner.style.opacity = "0.6";
      }
    };

    const onMove = (e: MouseEvent) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      applyInteractive(!!target.closest(INTERACTIVE_SELECTOR));
    };

    const onLeaveDoc = () => {
      ringWrap.style.opacity = "0";
      dotWrap.style.opacity = "0";
    };

    const onEnterDoc = () => {
      ringWrap.style.opacity = "1";
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
  }, []);

  if (!active) return null;

  const wrapStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 9999,
    width: 0,
    height: 0,
    willChange: "transform",
    transition: "opacity 200ms ease",
  };

  return (
    <>
      <div ref={ringWrapRef} style={wrapStyle}>
        <div
          ref={ringInnerRef}
          className="cursor-outer"
          style={{
            width: 28,
            height: 28,
            marginLeft: -14,
            marginTop: -14,
            borderRadius: "50%",
            border: "1.5px solid var(--color-brand)",
            background: "transparent",
            opacity: 0.6,
            transformOrigin: "center",
            transform: "scale(1)",
            transition: "transform 0.25s ease, opacity 0.25s ease",
            willChange: "transform, opacity",
          }}
        />
      </div>
      <div ref={dotWrapRef} style={wrapStyle}>
        <div
          ref={dotInnerRef}
          className="cursor-inner"
          style={{
            width: 5,
            height: 5,
            marginLeft: -2.5,
            marginTop: -2.5,
            borderRadius: "50%",
            background: "var(--color-brand)",
            transformOrigin: "center",
            transform: "scale(1)",
            willChange: "transform, opacity",
          }}
        />
      </div>
    </>
  );
}
