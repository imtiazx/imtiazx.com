"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function FooterCTA() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
      <div aria-hidden className="absolute inset-0">
        <div className="mesh-blob-purple" />
        <div className="mesh-blob-teal" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6"
        >
          <h2
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}
            className="text-3xl md:text-4xl lg:text-5xl leading-tight"
          >
            Built in public. Shipped to production.
          </h2>

          <p
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
            className="text-lg"
          >
            Exploring what AI systems can do when engineering discipline meets research curiosity.
          </p>

          <Link
            href="/work"
            style={{ backgroundColor: "var(--color-brand)", fontFamily: "var(--font-sans)" }}
            className="inline-flex items-center px-8 py-3.5 rounded-lg text-white text-sm font-medium transition-opacity duration-150 hover:opacity-90"
          >
            See the work
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
