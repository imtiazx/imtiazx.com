"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { opinions, type Opinion } from "@/lib/opinions";
import { useAudio } from "@/components/providers/AudioProvider";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const CARD_WIDTH = 340;
const CARD_GAP = 24; // must match the marginRight used for the seamless -50% loop

const HEADING = "What I Think";
const SUBTEXT =
  "Opinions, signal pieces, systems philosophy, AI infrastructure worldview.";

function OpinionCard({ opinion }: { opinion: Opinion }) {
  const { playSound } = useAudio();
  const [hovered, setHovered] = useState(false);
  const hasUrl = opinion.url !== "#";

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
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
      <span
        aria-hidden
        style={{
          fontFamily: "var(--font-sans)",
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
          fontFamily: "var(--font-sans)",
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
            fontFamily: "var(--font-sans)",
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
      // theme-adaptive background per product decision 2026-05-26
      style={{ backgroundColor: "var(--color-surface-alt)" }}
    >
      <div className="container">
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
          className="mt-3 text-base"
        >
          {SUBTEXT}
        </p>

        <div className="mt-10">
          {prefersReducedMotion ? (
            // Reduced motion: a plain horizontal scroll container, single set, no
            // animation.
            <div className="flex gap-6 overflow-x-auto pb-2 snap-x">
              {opinions.map((o) => (
                <div
                  key={o.id}
                  className="shrink-0 snap-start"
                  style={{ width: CARD_WIDTH }}
                >
                  <OpinionCard opinion={o} />
                </div>
              ))}
            </div>
          ) : (
            // Auto-scroll carousel: cards rendered twice end-to-end so the
            // translateX(-50%) loop is seamless. Pauses on hover (globals.css).
            <div className="perspectives-carousel relative overflow-hidden">
              <div className="perspectives-track flex">
                {[...opinions, ...opinions].map((o, i) => (
                  <div
                    key={`${o.id}-${i}`}
                    className="shrink-0"
                    style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
                  >
                    <OpinionCard opinion={o} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
