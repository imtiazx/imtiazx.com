"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ExperimentStandalone } from "@/lib/experiments";

interface Props {
  experiment: ExperimentStandalone;
}

export function ExperimentStandaloneCard({ experiment }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={prefersReducedMotion ? {} : { y: -3 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: hovered ? "var(--color-brand)" : "var(--color-border)",
        boxShadow: hovered ? "0 12px 30px var(--color-brand-light)" : "none",
        borderRadius: 16,
      }}
      className="border p-6 md:p-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-10 items-center transition-[border-color,box-shadow] duration-200"
    >
      <div
        style={{
          borderColor: "var(--color-border)",
          borderRadius: 12,
          backgroundColor: "var(--color-surface-alt)",
        }}
        className="border overflow-hidden order-1"
      >
        <Image
          src={experiment.poster.src}
          alt={experiment.poster.alt}
          width={experiment.poster.width}
          height={experiment.poster.height}
          sizes="(min-width: 1024px) 55vw, 90vw"
          className="block w-full h-auto"
          priority={false}
        />
      </div>

      <div className="flex flex-col min-w-0 order-2">
        <StatusBadge status={experiment.status} />

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
          className="text-2xl md:text-3xl leading-tight mt-3 mb-5"
        >
          {experiment.title}
        </h3>

        <div className="flex flex-col gap-4 mb-6">
          {experiment.description.map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--color-text-secondary)",
              }}
              className="text-sm md:text-[15px] leading-relaxed"
            >
              {para}
            </p>
          ))}
        </div>

        <div
          className="pt-4 mt-auto"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
            className="text-[11px] uppercase tracking-wider"
          >
            {experiment.timeline}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function StatusBadge({ status }: { status: ExperimentStandalone["status"] }) {
  return (
    <span className="inline-flex items-center gap-2 self-start">
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "var(--color-brand)",
          boxShadow: "0 0 8px var(--color-brand)",
        }}
        className="inline-block"
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-brand)",
        }}
        className="text-[10px] uppercase tracking-wider"
      >
        {status === "Ongoing" ? "Ongoing experiment" : "Planned experiment"}
      </span>
    </span>
  );
}
