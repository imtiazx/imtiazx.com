"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { opinions, type Opinion } from "@/lib/opinions";
import { useAudio } from "@/components/providers/AudioProvider";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function OpinionCard({ opinion }: { opinion: Opinion }) {
  const { playSound } = useAudio();
  const [hovered, setHovered] = useState(false);
  const hasUrl = opinion.url !== "#";

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => { setHovered(true); playSound("hover"); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#2A1F1A",
        borderColor: hovered ? "var(--color-brand)" : "#3D2E28",
        boxShadow: hovered ? "0 0 20px rgba(234, 88, 12, 0.12)" : "none",
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: "solid",
        position: "relative",
      }}
      className="flex flex-col h-full p-6 transition-[border-color,box-shadow] duration-200"
    >
      {/* Open-quote glyph */}
      <span
        aria-hidden
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--color-brand)",
          opacity: 0.4,
          fontSize: 72,
          lineHeight: 1,
          position: "absolute",
          top: 8,
          left: 16,
          pointerEvents: "none",
        }}
      >
        {"“"}
      </span>

      <h3
        style={{
          fontFamily: "var(--font-serif)",
          color: "#F5F0EB",
          fontSize: 16,
          lineHeight: 1.35,
        }}
        className="mt-6 line-clamp-2 shrink-0 relative z-10"
      >
        {opinion.title}
      </h3>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          color: "#A8A29E",
          fontSize: 13,
          lineHeight: 1.55,
        }}
        className="mt-2 line-clamp-3 flex-1 relative z-10"
      >
        {opinion.oneliner}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 shrink-0 relative z-10">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            borderColor: "var(--color-brand)",
            color: "var(--color-brand)",
          }}
          className="inline-block border rounded px-2 py-0.5 text-[10px] uppercase tracking-wider"
        >
          {opinion.platform}
        </span>

        {hasUrl && (
          <a
            href={opinion.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound("click")}
            aria-label={`Read on ${opinion.platform}`}
            style={{ color: "#A8A29E" }}
            className="inline-flex items-center transition-colors duration-150 hover:text-[var(--color-brand)]"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export function PerspectivesSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="py-20"
      style={{ backgroundColor: "#1C1412" }}
    >
      <div className="container">
        <h2
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-surface)" }}
          className="text-3xl md:text-4xl"
        >
          What I think
        </h2>
        <p
          style={{ fontFamily: "var(--font-sans)", color: "#A8A29E" }}
          className="mt-3 text-base"
        >
          Strong opinions, loosely held. Loudly published.
        </p>

        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none"
        >
          {opinions.map((o) => (
            <div key={o.id} className="snap-start md:snap-align-none">
              <OpinionCard opinion={o} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
