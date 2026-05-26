"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { hackathons, type Hackathon } from "@/lib/hackathons";
import { useAudio } from "@/components/providers/AudioProvider";
import { ChipTag } from "@/components/ui/ChipTag";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
  onActivate,
}: {
  href: string | null;
  label: string;
  onActivate?: () => void;
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
      onClick={onActivate}
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
}: {
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={prefersReducedMotion ? {} : { y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: hovered ? "var(--color-brand)" : "var(--color-border)",
        boxShadow: hovered ? "0 8px 24px var(--color-brand-light)" : "none",
        borderRadius: 12,
      }}
      className="group flex flex-col h-full p-6 border transition-[border-color,box-shadow] duration-200"
    >
      {children}
    </motion.div>
  );
}

function ActiveCard({ h }: { h: Hackathon }) {
  const { playSound } = useAudio();
  return (
    <CardShell>
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
          onActivate={() => playSound("click")}
        />
      </div>
    </CardShell>
  );
}

function CompletedCard({ h }: { h: Hackathon }) {
  const { playSound } = useAudio();
  return (
    <CardShell>
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
          onActivate={() => playSound("click")}
        />
      </div>
    </CardShell>
  );
}

export function HackathonsSection() {
  const prefersReducedMotion = useReducedMotion();
  const active = pickMostRecent(hackathons.filter((h) => h.status === "Active"));
  const completed = pickMostRecent(hackathons.filter((h) => h.status === "Completed"));

  if (!active && !completed) return null;

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
          className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-6 items-stretch"
        >
          {active && <ActiveCard h={active} />}
          {completed && <CompletedCard h={completed} />}
        </motion.div>
      </div>
    </section>
  );
}
