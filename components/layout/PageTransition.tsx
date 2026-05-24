"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAudio } from "@/components/providers/AudioProvider";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { playSound } = useAudio();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    playSound("transition");
  }, [pathname, playSound]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
        exit={
          prefersReducedMotion
            ? { opacity: 1 }
            : { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
