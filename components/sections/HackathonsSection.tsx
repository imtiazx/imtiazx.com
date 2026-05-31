"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ExternalLink } from "lucide-react";
import { hackathons, type Hackathon } from "@/lib/hackathons";
import { ChipTag } from "@/components/ui/ChipTag";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// "Winning" sparkle layer: 4-point glitter stars at randomized positions with
// staggered twinkle animations. Only renders while the parent card is hovered
// so it doesn't run continuously off-screen. Reduced-motion skips it entirely.
const SPARKLE_COUNT = 16;
function SparkleLayer() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
        id: i,
        left: 4 + Math.random() * 92,
        top: 4 + Math.random() * 92,
        size: 7 + Math.random() * 9,
        delay: Math.random() * 1.4,
        duration: 1.2 + Math.random() * 0.9,
        hue: i % 3 === 0 ? 44 : i % 3 === 1 ? 32 : 22,
      })),
    [],
  );
  return (
    <div
      aria-hidden
      className="sparkle-layer"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        borderRadius: 12,
        zIndex: 1,
      }}
    >
      {sparkles.map((s) => (
        <svg
          key={s.id}
          viewBox="0 0 24 24"
          width={s.size}
          height={s.size}
          className="sparkle-star"
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            color: `hsl(${s.hue}, 95%, 62%)`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          <path
            d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z"
            fill="currentColor"
          />
        </svg>
      ))}
      <style jsx>{`
        .sparkle-star {
          opacity: 0;
          transform-origin: center;
          animation-name: sparkleTwinkle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          filter: drop-shadow(0 0 4px currentColor);
        }
        @keyframes sparkleTwinkle {
          0%,
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
          }
          40% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(120deg);
          }
          70% {
            opacity: 0.85;
            transform: translate(-50%, -50%) scale(1.08) rotate(220deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sparkle-star {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// Active card (left of grid) slides in from the left edge of the viewport,
// completed card (right) slides in from the right. Variant function reads the
// custom prop on each child so the grid can mirror its layout in motion.
const itemVariants: Variants = {
  hidden: (direction: "left" | "right") => ({
    opacity: 0,
    x: direction === "left" ? "-55vw" : "55vw",
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const HEADING = "What I Compete In";
const SUBTEXT =
  "Kaggle, hackathons, rankings, research competitions, external validation.";

function pickMostRecent(list: Hackathon[]): Hackathon | undefined {
  if (list.length === 0) return undefined;
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

function PlatformChip({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-sans)",
        borderColor: "var(--color-brand)",
        color: "var(--color-brand)",
      }}
      className="inline-block border rounded px-2 py-0.5 text-[11px] uppercase tracking-wider"
    >
      {label}
    </span>
  );
}

function GhostExternalLink({
  href,
  label,
}: {
  href: string | null;
  label: string;
}) {
  // No competition page yet -> greyed, non-interactive placeholder.
  if (!href) {
    return (
      <span
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-muted)",
          borderColor: "var(--color-border)",
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] opacity-40 cursor-not-allowed pointer-events-none"
        aria-disabled
      >
        <ExternalLink size={13} />
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: "var(--font-sans)",
        color: "var(--color-text-muted)",
        borderColor: "var(--color-border)",
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] bg-transparent transition-colors duration-150 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
    >
      <ExternalLink size={13} />
      {label}
    </a>
  );
}

function CardShell({
  children,
  glitter = false,
  direction = "left",
}: {
  children: React.ReactNode;
  /** Render a glitter sparkle layer + warm gold accent while hovered. Used to
   *  signal "winning" on placement cards like the LangFlow 3rd-place card. */
  glitter?: boolean;
  /** Which side this card slides in from when scrolling into view. */
  direction?: "left" | "right";
}) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const showGlitter = glitter && hovered && !prefersReducedMotion;

  return (
    <motion.div
      custom={direction}
      variants={itemVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={prefersReducedMotion ? {} : { y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        position: "relative",
        backgroundColor: "var(--color-surface)",
        borderColor: hovered
          ? glitter
            ? "hsl(42, 95%, 60%)"
            : "var(--color-brand)"
          : "var(--color-border)",
        boxShadow: hovered
          ? glitter
            ? "0 10px 28px rgba(234, 88, 12, 0.18), inset 0 0 28px rgba(255, 200, 60, 0.16)"
            : "0 8px 24px var(--color-brand-light)"
          : "none",
        borderRadius: 12,
      }}
      className="group flex flex-col h-full p-6 border transition-[border-color,box-shadow] duration-200"
    >
      {children}
      {showGlitter && <SparkleLayer />}
    </motion.div>
  );
}

function ActiveCard({ h }: { h: Hackathon }) {
  return (
    <CardShell direction="left">
      {/* LIVE row */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <span
          aria-hidden
          className="live-dot inline-block"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "var(--color-green)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-green)",
          }}
          className="text-[10px] uppercase tracking-wider group-hover:animate-[statusGlow_1.2s_ease-in-out_infinite_alternate]"
        >
          LIVE
        </span>
      </div>

      <h3
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
        className="text-2xl md:text-3xl leading-snug mb-3 shrink-0"
      >
        {h.name}
      </h3>

      <div className="mb-3 shrink-0">
        <PlatformChip label={h.platform} />
      </div>

      <p
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
        className="text-sm leading-relaxed line-clamp-3 mb-4 shrink-0"
      >
        {h.description}
      </p>

      <div className="mb-4 shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {h.tags.map((tag) => (
            <ChipTag key={tag} label={tag} />
          ))}
        </div>
      </div>

      {/* Rank display */}
      <div className="my-4 shrink-0">
        <div
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-brand)",
            fontSize: 48,
            lineHeight: 1,
          }}
        >
          {h.rank ?? "--"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-muted)",
            fontSize: 11,
          }}
          className="mt-2 uppercase tracking-wider"
        >
          Public leaderboard rank
        </div>
      </div>

      <div className="flex-1 min-h-[0.5rem]" />

      <div
        className="pt-4 mt-2 shrink-0"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <GhostExternalLink
          href={h.competitionUrl}
          label="View competition"
        />
      </div>
    </CardShell>
  );
}

function CompletedCard({ h }: { h: Hackathon }) {
  return (
    <CardShell glitter direction="right">
      {/* COMPLETED chip */}
      <div className="mb-4 shrink-0">
        <span
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-amber)",
            backgroundColor: "var(--color-amber-light)",
          }}
          className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider group-hover:animate-[statusGlow_1.2s_ease-in-out_infinite_alternate]"
        >
          COMPLETED
        </span>
      </div>

      <h3
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
        className="text-2xl leading-snug mb-3 shrink-0"
      >
        {h.name}
      </h3>

      {h.placement && (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-brand)",
          }}
          className="text-3xl md:text-4xl leading-tight mb-3 shrink-0"
        >
          {h.placement}
        </div>
      )}

      <p
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
        className="text-sm leading-relaxed line-clamp-3 mb-4 shrink-0"
      >
        {h.description}
      </p>

      <div className="mb-4 shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {h.tags.map((tag) => (
            <ChipTag key={tag} label={tag} />
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[0.5rem]" />

      <div
        className="pt-4 mt-2 shrink-0"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <GhostExternalLink
          href={h.competitionUrl}
          label="View competition"
        />
      </div>
    </CardShell>
  );
}

export function HackathonsSection() {
  const prefersReducedMotion = useReducedMotion();
  const active = pickMostRecent(hackathons.filter((h) => h.status === "Active"));
  const completed = pickMostRecent(hackathons.filter((h) => h.status === "Completed"));
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { amount: 0.15 });
  const animateState = prefersReducedMotion || isInView ? "visible" : "hidden";

  if (!active && !completed) return null;

  return (
    <section className="py-20 lg:py-28 overflow-x-clip">
      <div className="container">
        <div className="mb-12">
          <ScrollReveal variant="fadeUp">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
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
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={animateState}
          className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-6 items-stretch"
        >
          {active && <ActiveCard h={active} />}
          {completed && <CompletedCard h={completed} />}
        </motion.div>
      </div>
    </section>
  );
}
