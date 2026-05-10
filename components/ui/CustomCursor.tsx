"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, select, textarea, label";

export function CustomCursor() {
  const [active, setActive] = useState(false);
  const [scaled, setScaled] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { damping: 28, stiffness: 700 });
  const y = useSpring(rawY, { damping: 28, stiffness: 700 });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchOnly = window.matchMedia("(hover: none)").matches;
    if (reducedMotion || touchOnly) return;

    setActive(true);
    document.body.style.cursor = "none";

    const onMouseMove = (e: MouseEvent) => {
      rawX.set(e.clientX - 4);
      rawY.set(e.clientY - 4);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      setScaled(!!target.closest(INTERACTIVE_SELECTOR));
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      document.body.style.cursor = "";
    };
  }, [rawX, rawY]);

  if (!active) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x,
        y,
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "var(--color-purple)",
        pointerEvents: "none",
        zIndex: 9999,
      }}
      animate={{ scale: scaled ? 2 : 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    />
  );
}
