"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { opinions, type Opinion } from "@/lib/opinions";
import { useAudio } from "@/components/providers/AudioProvider";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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

function DraggableTrack({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [constraint, setConstraint] = useState(0);
  const [hinted, setHinted] = useState(true);

  useEffect(() => {
    const update = () => {
      const wrap = wrapperRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      const max = Math.max(0, track.scrollWidth - wrap.clientWidth);
      setConstraint(max);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const onDragStart = () => setHinted(false);

  return (
    <div ref={wrapperRef} className="relative overflow-hidden">
      <motion.div
        ref={trackRef}
        drag="x"
        dragConstraints={{ left: -constraint, right: 0 }}
        dragElastic={0.1}
        dragMomentum
        onDragStart={onDragStart}
        className="flex gap-6 items-stretch will-change-transform"
        style={{ touchAction: "pan-y", cursor: constraint > 0 ? "grab" : "default" }}
        whileTap={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>

      {constraint > 0 && (
        <>
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 56,
              pointerEvents: "none",
              background:
                "linear-gradient(to right, #1C1412 0%, rgba(28, 20, 18, 0) 100%)",
              opacity: hinted ? 1 : 0,
              transition: "opacity 600ms ease",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: 56,
              pointerEvents: "none",
              background:
                "linear-gradient(to left, #1C1412 0%, rgba(28, 20, 18, 0) 100%)",
              opacity: hinted ? 1 : 0,
              transition: "opacity 600ms ease",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: 12,
              transform: "translateY(-50%)",
              color: "var(--color-brand)",
              opacity: hinted ? 0.7 : 0,
              transition: "opacity 600ms ease",
              pointerEvents: "none",
            }}
          >
            <ChevronLeft size={20} />
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              right: 12,
              transform: "translateY(-50%)",
              color: "var(--color-brand)",
              opacity: hinted ? 0.7 : 0,
              transition: "opacity 600ms ease",
              pointerEvents: "none",
            }}
          >
            <ChevronRight size={20} />
          </div>
        </>
      )}
    </div>
  );
}

export function PerspectivesSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="py-20"
      // Intentional fixed dark background regardless of theme.
      style={{ backgroundColor: "#1C1412" }}
    >
      <div className="container">
        <ScrollReveal variant="scramble">
          <h2
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-surface)" }}
            className="text-3xl md:text-4xl"
          >
            What I think
          </h2>
        </ScrollReveal>
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
          className="mt-10"
        >
          <div className="hidden lg:block">
            <DraggableTrack>
              {opinions.map((o) => (
                <div key={o.id} className="shrink-0" style={{ width: 340 }}>
                  <OpinionCard opinion={o} />
                </div>
              ))}
            </DraggableTrack>
          </div>

          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch overflow-x-auto snap-x snap-mandatory">
            {opinions.map((o) => (
              <div key={o.id} className="snap-start">
                <OpinionCard opinion={o} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
