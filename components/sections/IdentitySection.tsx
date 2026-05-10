"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { person, type IdentityCard } from "@/lib/person";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function IdentityItem({ card }: { card: IdentityCard }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col"
    >
      <h3
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
        className="text-base font-semibold leading-snug"
      >
        {card.title}
      </h3>

      {/* Animated underline */}
      <div
        style={{
          height: "1px",
          width: hovered ? "100%" : "32px",
          backgroundColor: hovered ? "var(--color-brand)" : "var(--color-border)",
          transition: "width 300ms ease, background-color 300ms ease",
          marginTop: "8px",
        }}
      />

      <p
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
        className="text-sm leading-relaxed mt-3"
      >
        {card.description}
      </p>
    </motion.div>
  );
}

export function IdentitySection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      style={{ backgroundColor: "var(--color-surface)" }}
      className="py-20 lg:py-28"
    >
      <div className="container">
        <h2
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}
          className="text-3xl md:text-4xl mb-12"
        >
          What I bring
        </h2>

        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {person.identityCards.map((card) => (
            <IdentityItem key={card.title} card={card} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
