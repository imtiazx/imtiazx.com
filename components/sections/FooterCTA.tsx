"use client";

import { motion, useReducedMotion } from "framer-motion";
import { person } from "@/lib/person";

export function FooterCTA() {
  const prefersReducedMotion = useReducedMotion();
  const ctaHref = person.social.linkedin
    ? person.social.linkedin
    : `mailto:${person.social.email}`;

  return (
    <section className="relative overflow-hidden py-28 lg:py-36 px-6 md:px-12 lg:px-20">
      <div aria-hidden className="absolute inset-0">
        <div className="mesh-blob-purple" />
        <div className="mesh-blob-teal" />
      </div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-6"
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-text-primary)",
          }}
          className="text-3xl md:text-4xl lg:text-5xl leading-tight"
        >
          {"Let's build something that matters."}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-secondary)",
          }}
          className="text-lg"
        >
          Open to senior AI engineering roles and technical collaborations.
        </p>

        <a
          href={ctaHref}
          target={person.social.linkedin ? "_blank" : undefined}
          rel={person.social.linkedin ? "noopener noreferrer" : undefined}
          style={{
            backgroundColor: "var(--color-purple)",
            fontFamily: "var(--font-sans)",
          }}
          className="inline-flex items-center px-8 py-3.5 rounded-lg text-white text-sm font-medium transition-opacity duration-150 hover:opacity-90"
        >
          {person.social.linkedin ? "Connect on LinkedIn" : "Get in touch"}
        </a>
      </motion.div>
    </section>
  );
}
