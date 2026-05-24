"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, select, textarea, label, .interactive";
const TEXT_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, blockquote, li, span, em, strong";

type HoverMode = "default" | "interactive" | "text";

export function CustomCursor() {
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const dotWrapRef = useRef<HTMLDivElement>(null);
  const ringInnerRef = useRef<HTMLDivElement>(null);
  const dotInnerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchOnly = window.matchMedia("(hover: none)").matches;
    if (reducedMotion || touchOnly) return;

    const ringWrap = ringWrapRef.current;
    const dotWrap = dotWrapRef.current;
    const ringInner = ringInnerRef.current;
    const dotInner = dotInnerRef.current;
    if (!ringWrap || !dotWrap || !ringInner || !dotInner) return;

    setActive(true);
    document.body.style.cursor = "none";

    const ringX = gsap.quickTo(ringWrap, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(ringWrap, "y", { duration: 0.5, ease: "power3" });
    const dotX = gsap.quickTo(dotWrap, "x", { duration: 0.1, ease: "power3" });
    const dotY = gsap.quickTo(dotWrap, "y", { duration: 0.1, ease: "power3" });

    let mode: HoverMode = "default";

    const applyMode = (next: HoverMode) => {
      if (next === mode) return;
      mode = next;
      if (next === "interactive") {
        ringInner.style.transform = "scale(2.5)";
        ringInner.style.opacity = "0.5";
        ringInner.style.mixBlendMode = "normal";
        ringInner.style.background = "transparent";
        ringInner.style.borderColor = "var(--color-brand)";
        dotInner.style.transform = "scale(0)";
      } else if (next === "text") {
        ringInner.style.transform = "scale(1.5)";
        ringInner.style.opacity = "1";
        ringInner.style.mixBlendMode = "difference";
        ringInner.style.background = "#FFFFFF";
        ringInner.style.borderColor = "transparent";
        dotInner.style.transform = "scale(0)";
      } else {
        ringInner.style.transform = "scale(1)";
        ringInner.style.opacity = "1";
        ringInner.style.mixBlendMode = "normal";
        ringInner.style.background = "transparent";
        ringInner.style.borderColor = "var(--color-brand)";
        dotInner.style.transform = "scale(1)";
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
      if (target.closest(INTERACTIVE_SELECTOR)) {
        applyMode("interactive");
      } else if (target.closest(TEXT_SELECTOR)) {
        applyMode("text");
      } else {
        applyMode("default");
      }
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
          style={{
            width: 32,
            height: 32,
            marginLeft: -16,
            marginTop: -16,
            borderRadius: "50%",
            border: "1.5px solid var(--color-brand)",
            background: "transparent",
            transformOrigin: "center",
            transform: "scale(1)",
            transition:
              "transform 0.3s ease, opacity 0.3s ease, background 0.3s ease, border-color 0.3s ease, mix-blend-mode 0.3s ease",
            willChange: "transform, opacity",
          }}
        />
      </div>
      <div ref={dotWrapRef} style={wrapStyle}>
        <div
          ref={dotInnerRef}
          style={{
            width: 6,
            height: 6,
            marginLeft: -3,
            marginTop: -3,
            borderRadius: "50%",
            background: "var(--color-brand)",
            transformOrigin: "center",
            transform: "scale(1)",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            willChange: "transform, opacity",
          }}
        />
      </div>
    </>
  );
}
