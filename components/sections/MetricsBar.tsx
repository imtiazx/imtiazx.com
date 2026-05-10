"use client";

import { motion, useReducedMotion } from "framer-motion";
import { person } from "@/lib/person";

export function MetricsBar() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section style={{ backgroundColor: "var(--color-surface)" }} className="py-14">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {person.metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ borderColor: "var(--color-border)" }}
              className={`flex flex-col items-center text-center gap-2 py-6 px-4 md:px-8 ${
                i < person.metrics.length - 1 ? "md:border-r" : ""
              }`}
            >
              <span
                style={{ fontFamily: "var(--font-serif)", color: "var(--color-brand)" }}
                className="text-4xl md:text-5xl"
              >
                {metric.value}
              </span>
              <span
                style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
                className="text-sm leading-snug"
              >
                {metric.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
