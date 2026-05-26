"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { person, type IdentityCard } from "@/lib/person";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const HEADING = "What I Bring";
const SUBTEXT =
  "Capabilities, engineering range, systems thinking, operational strengths.";

function IdentityItem({ card }: { card: IdentityCard }) {
  const [hovered, setHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={itemVariants}
      whileHover={prefersReducedMotion ? {} : { y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: hovered ? "var(--color-brand)" : "var(--color-border)",
        boxShadow: hovered ? "0 8px 24px var(--color-brand-light)" : "none",
        borderRadius: 12,
      }}
      className="group flex flex-col h-full p-6 border transition-[border-color,box-shadow] duration-200"
    >
      {/* Role title in brand orange; glows on card hover. statusGlow uses
          currentColor, so the glow resolves to --color-brand automatically. */}
      <h3
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-brand)" }}
        className="text-base font-semibold leading-snug shrink-0 group-hover:animate-[statusGlow_1.2s_ease-in-out_infinite_alternate]"
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
          flexShrink: 0,
        }}
      />

      <p
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
        className="text-sm leading-relaxed mt-3 flex-1"
      >
        {card.description}
      </p>
    </motion.div>
  );
}

export function IdentitySection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="mb-12">
          <ScrollReveal variant="scramble">
            <h2
              style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
              className="text-3xl md:text-4xl"
            >
              {HEADING}
            </h2>
          </ScrollReveal>
          <p
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
            className="mt-3 text-base md:text-lg max-w-2xl"
          >
            {SUBTEXT}
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {person.identityCards.map((card) => (
            <IdentityItem key={card.title} card={card} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
