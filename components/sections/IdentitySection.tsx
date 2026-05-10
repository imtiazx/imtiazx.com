"use client";

import { motion, useReducedMotion } from "framer-motion";
import { person } from "@/lib/person";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function IdentitySection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      style={{ backgroundColor: "var(--color-surface)" }}
      className="py-20 lg:py-28 px-6 md:px-12 lg:px-20"
    >
      <div className="max-w-7xl mx-auto">
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-text-primary)",
          }}
          className="text-3xl md:text-4xl mb-12"
        >
          What I bring
        </h2>

        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {person.identityCards.map((card) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              style={{
                backgroundColor: "var(--color-background)",
                borderColor: "var(--color-border)",
              }}
              className="group flex flex-col gap-2 p-6 rounded-xl border border-l-2 border-l-transparent hover:border-l-[var(--color-purple)] transition-colors duration-200"
            >
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-text-primary)",
                }}
                className="text-base font-semibold"
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-text-muted)",
                }}
                className="text-sm leading-relaxed"
              >
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
