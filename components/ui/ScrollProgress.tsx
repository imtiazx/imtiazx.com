"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.3,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname !== "/") return null;

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 998,
        backgroundColor: "var(--color-brand)",
        transformOrigin: "0% 50%",
        scaleX: width,
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease",
        pointerEvents: "none",
      }}
    />
  );
}
