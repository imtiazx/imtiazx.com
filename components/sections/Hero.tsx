"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { person } from "@/lib/person";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const initial = prefersReducedMotion ? "visible" : "hidden";

  return (
    <section className="relative flex items-center min-h-screen overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div className="mesh-blob-purple" />
        <div className="mesh-blob-teal" />
      </div>

      <div className="container relative z-10 py-24">
        <motion.h1
          variants={fadeUp}
          initial={initial}
          animate="visible"
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1], delay: 0 }}
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}
          className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6"
        >
          {person.tagline}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial={initial}
          animate="visible"
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1], delay: 0.08 }}
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
          className="text-lg leading-relaxed mb-10 max-w-2xl"
        >
          {person.bio}
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial={initial}
          animate="visible"
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1], delay: 0.16 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            href="/lab"
            style={{ backgroundColor: "var(--color-brand)", fontFamily: "var(--font-sans)" }}
            className="inline-flex items-center px-6 py-3 rounded-lg text-white text-sm font-medium transition-opacity duration-150 hover:opacity-90"
          >
            View my work
          </Link>

          <Link
            href="/signal"
            style={{
              borderColor: "var(--color-brand)",
              color: "var(--color-brand)",
              fontFamily: "var(--font-sans)",
            }}
            className="inline-flex items-center px-6 py-3 rounded-lg border text-sm font-medium bg-transparent transition-colors duration-150 hover:bg-[var(--color-surface)]"
          >
            Read my writing
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
