"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Globe, ExternalLink } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { person } from "@/lib/person";

// ---------------------------------------------------------------------------
// Bio
// ---------------------------------------------------------------------------

// Intentional terminal styling: fixed dark surface and syntax colors regardless of theme.
function CodeBlock() {
  // Tokens written out so syntax colors stay precise.
  const keyStyle = { color: "var(--color-brand)", fontFamily: "var(--font-mono)" };
  const stringStyle = { color: "var(--color-teal)", fontFamily: "var(--font-mono)" };
  const punctStyle = { color: "#A8A29E", fontFamily: "var(--font-mono)" };
  const kwStyle = { color: "#FB923C", fontFamily: "var(--font-mono)" };
  const idStyle = { color: "#F5F0EB", fontFamily: "var(--font-mono)" };
  const commentStyle = { color: "#6B5E57", fontFamily: "var(--font-mono)", fontStyle: "italic" as const };

  return (
    <div
      style={{
        backgroundColor: "#1C1917",
        borderRadius: 12,
        border: "1px solid #292524",
      }}
      className="p-6 md:p-7 text-[13px] leading-7 overflow-x-auto"
    >
      <div className="flex items-center gap-1.5 mb-4 shrink-0">
        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "#FB7185" }} />
        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "#FBBF24" }} />
        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "#34D399" }} />
        <span style={{ fontFamily: "var(--font-mono)", color: "#6B5E57" }} className="ml-3 text-[11px]">
          imtiaz.ts
        </span>
      </div>

      <pre className="whitespace-pre-wrap">
        <span style={commentStyle}>{"// who I am, in fewer characters"}</span>
        {"\n"}
        <span style={kwStyle}>const</span>{" "}
        <span style={idStyle}>imtiaz</span>
        <span style={punctStyle}> = {"{"}</span>
        {"\n"}
        {"  "}<span style={keyStyle}>role</span>
        <span style={punctStyle}>: </span>
        <span style={stringStyle}>{`"AI Engineer"`}</span>
        <span style={punctStyle}>,</span>
        {"\n"}
        {"  "}<span style={keyStyle}>company</span>
        <span style={punctStyle}>: </span>
        <span style={stringStyle}>{`"Accenture Industry X"`}</span>
        <span style={punctStyle}>,</span>
        {"\n"}
        {"  "}<span style={keyStyle}>focus</span>
        <span style={punctStyle}>: [</span>
        <span style={stringStyle}>{`"RAG"`}</span>
        <span style={punctStyle}>, </span>
        <span style={stringStyle}>{`"Agents"`}</span>
        <span style={punctStyle}>, </span>
        <span style={stringStyle}>{`"Responsible AI"`}</span>
        <span style={punctStyle}>],</span>
        {"\n"}
        {"  "}<span style={keyStyle}>building</span>
        <span style={punctStyle}>: [</span>
        <span style={stringStyle}>{`"RAGScope"`}</span>
        <span style={punctStyle}>, </span>
        <span style={stringStyle}>{`"DocuAgent"`}</span>
        <span style={punctStyle}>],</span>
        {"\n"}
        {"  "}<span style={keyStyle}>competing</span>
        <span style={punctStyle}>: </span>
        <span style={stringStyle}>{`"Kaggle #115"`}</span>
        <span style={punctStyle}>,</span>
        {"\n"}
        {"  "}<span style={keyStyle}>os</span>
        <span style={punctStyle}>: </span>
        <span style={stringStyle}>{`"Linux (obviously)"`}</span>
        <span style={punctStyle}>,</span>
        {"\n"}
        {"  "}<span style={keyStyle}>coffee</span>
        <span style={punctStyle}>: </span>
        <span style={stringStyle}>{`"mandatory"`}</span>
        <span style={punctStyle}>,</span>
        {"\n"}
        <span style={punctStyle}>{"};"}</span>
      </pre>
    </div>
  );
}

function SocialButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "var(--font-sans)",
        color: hovered ? "var(--color-brand)" : "var(--color-text-muted)",
        borderColor: hovered ? "var(--color-brand)" : "var(--color-border)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "color 200ms ease, border-color 200ms ease, transform 200ms ease",
      }}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-[13px]"
    >
      {icon}
      {label}
    </a>
  );
}

function BioSection() {
  return (
    <section className="mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div>
          <ScrollReveal variant="fadeUp">
            <p
              style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
              className="text-base leading-relaxed"
            >
              Imtiaz is an AI engineer at Accenture Industry X, working at the intersection of
              Generative AI and responsible deployment. His day is split between RAG systems that
              ship, agent pipelines that don&apos;t lie, and the evaluation discipline that decides
              whether either are allowed into production.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.05}>
            <p
              style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
              className="text-base leading-relaxed mt-5"
            >
              What he cares about: RAG systems that survive real users, agents that refuse to
              hallucinate when it matters, and AI that can be audited and explained instead of
              defended. The boring engineering disciplines applied to the loudest part of the
              industry.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <p
              style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
              className="text-base leading-relaxed mt-5"
            >
              Off the clock he is an open-source builder and Linux loyalist, with strong opinions
              about nuclear energy as the only honest answer to AI&apos;s power problem and about
              information that wants to be free. 3rd of 12,000+ at the AI Devs India LangFlow
              Challenge, and he&apos;ll bring it up when it&apos;s relevant.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.15}>
            <p
              style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
              className="text-base leading-relaxed mt-5"
            >
              Originally from India, currently building from wherever the work and the coffee
              are good. He writes to think clearly, ships to learn faster, and treats every
              engagement as a chance to leave the system better documented than he found it.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fadeUp" delay={0.2}>
            <div className="mt-7 flex flex-wrap gap-3">
              <SocialButton
                href={person.social.github}
                icon={<Globe size={14} />}
                label="github.com/imtiazx"
              />
              <SocialButton
                href={person.social.linkedin}
                icon={<ExternalLink size={14} />}
                label="linkedin.com/in/imtiazx"
              />
              <SocialButton
                href={person.social.kaggleUrl}
                icon={<BrandIcon name="kaggle" size={14} />}
                label="kaggle.com/ximtiazx"
              />
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal variant="fadeUp" delay={0.1}>
          <CodeBlock />
        </ScrollReveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

interface TimelineEntry {
  date: string;
  title: string;
  description: string;
}

const TIMELINE: TimelineEntry[] = [
  {
    date: "2024 - Present",
    title: "AI Engineer, Accenture Industry X",
    description:
      "Generative AI R&D, responsible AI evaluation, and enterprise RAG deployments across 25+ studies.",
  },
  {
    date: "2024",
    title: "AI Devs India LangFlow Challenge -- 3rd of 12,000+",
    description:
      "Implemented advanced prompt engineering techniques within LangFlow workflows. Live AI engineering challenge across India. Prize: ₹25,000.",
  },
  {
    date: "2024",
    title: "Kaggle Competitor",
    description:
      "Rogii Wellbore Geology Prediction, currently rank #276 (Top 10%) on the public leaderboard.",
  },
  {
    date: "2023 - Present",
    title: "Open Source Builder",
    description:
      "RAGScope live for production RAG evaluation. DocuAgent in active development for enterprise document intelligence.",
  },
  {
    date: "2022 - 2024",
    title: "Data Scientist, Accenture",
    description:
      "Statistical modeling, ML pipelines, and enterprise deployments before the GenAI shift.",
  },
];

function TimelineNode({ entry, index }: { entry: TimelineEntry; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const isLeft = index % 2 === 0;

  const fromX = prefersReducedMotion ? 0 : isLeft ? -24 : 24;

  return (
    <motion.div
      initial={{ opacity: 0, x: fromX }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-12 last:mb-0"
    >
      {/* Node circle, centered on the timeline line on desktop */}
      <span
        aria-hidden
        style={{
          backgroundColor: "var(--color-brand)",
          boxShadow: "0 0 0 4px var(--color-bg)",
        }}
        className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1.5 w-3 h-3 rounded-full"
      />
      <span
        aria-hidden
        style={{
          backgroundColor: "var(--color-brand)",
          boxShadow: "0 0 0 4px var(--color-bg)",
        }}
        className="md:hidden absolute -left-[7px] top-1.5 w-3 h-3 rounded-full"
      />

      {isLeft ? (
        <>
          <div className="md:text-right md:pr-12">
            <TimelineCard entry={entry} alignRight />
          </div>
          <div className="hidden md:block" />
        </>
      ) : (
        <>
          <div className="hidden md:block" />
          <div className="md:pl-12">
            <TimelineCard entry={entry} />
          </div>
        </>
      )}
    </motion.div>
  );
}

function TimelineCard({ entry, alignRight }: { entry: TimelineEntry; alignRight?: boolean }) {
  return (
    <div className={alignRight ? "md:items-end" : ""}>
      <div
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-brand)" }}
        className="text-[11px] uppercase tracking-widest"
      >
        {entry.date}
      </div>
      <h3
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
        className="mt-2 text-base md:text-lg font-semibold leading-snug"
      >
        {entry.title}
      </h3>
      <p
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
        className="mt-2 text-sm leading-relaxed max-w-md"
      >
        {entry.description}
      </p>
    </div>
  );
}

function TimelineSection() {
  return (
    <section className="mt-24">
      <ScrollReveal variant="fadeUp">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
          className="text-3xl md:text-4xl mb-12"
        >
          Timeline
        </h2>
      </ScrollReveal>

      <div className="relative">
        {/* Vertical line: centered on desktop, left on mobile */}
        <div
          aria-hidden
          style={{ backgroundColor: "var(--color-border)" }}
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px]"
        />
        <div
          aria-hidden
          style={{ backgroundColor: "var(--color-border)" }}
          className="md:hidden absolute left-0 top-0 bottom-0 w-[2px]"
        />

        <div className="pl-6 md:pl-0">
          {TIMELINE.map((entry, i) => (
            <TimelineNode key={entry.title} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Right now
// ---------------------------------------------------------------------------

type FocusStatus = "Development" | "Live" | "Ideation";

interface FocusCard {
  label: string;
  title: string;
  description: string;
  status: FocusStatus;
}

const FOCUS_CARDS: FocusCard[] = [
  {
    label: "Building",
    title: "DocuAgent",
    description: "Multi-agent document intelligence for enterprise workflows.",
    status: "Development",
  },
  {
    label: "Competing",
    title: "Rogii Wellbore Geology",
    description: "Kaggle competition, currently rank #276 (Top 10%) on the public leaderboard.",
    status: "Live",
  },
  {
    label: "Exploring",
    title: "RAG Eval & Red-Teaming",
    description: "RAG evaluation methodologies and responsible AI red-teaming patterns.",
    status: "Ideation",
  },
];

function StatusChip({ status }: { status: FocusStatus }) {
  if (status === "Live") {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden
          className="live-dot inline-block"
          style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-green)" }}
        />
        <span
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-green)" }}
          className="text-[10px] uppercase tracking-wider"
        >
          LIVE
        </span>
      </span>
    );
  }
  const style =
    status === "Development"
      ? { backgroundColor: "var(--color-brand)", color: "#ffffff" }
      : { backgroundColor: "var(--color-amber-light)", color: "var(--color-amber)" };
  return (
    <span
      style={{ ...style, fontFamily: "var(--font-sans)" }}
      className="inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium"
    >
      {status}
    </span>
  );
}

function FocusCardItem({ card }: { card: FocusCard }) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
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
      className="flex flex-col h-full p-6 border transition-[border-color,box-shadow] duration-200"
    >
      <div
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
        className="text-[11px] uppercase tracking-widest shrink-0"
      >
        {card.label}
      </div>
      <h3
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
        className="mt-2 text-xl md:text-2xl leading-snug shrink-0"
      >
        {card.title}
      </h3>
      <p
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
        className="mt-3 text-sm leading-relaxed flex-1"
      >
        {card.description}
      </p>
      <div className="mt-5 shrink-0">
        <StatusChip status={card.status} />
      </div>
    </motion.div>
  );
}

function RightNowSection() {
  return (
    <section className="mt-24">
      <ScrollReveal variant="fadeUp">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
          className="text-3xl md:text-4xl mb-8"
        >
          Right now
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {FOCUS_CARDS.map((card) => (
          <FocusCardItem key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  return (
    <main className="container py-20">
      <ScrollReveal variant="fadeUp">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
          className="text-4xl md:text-5xl lg:text-6xl"
        >
          About
        </h1>
      </ScrollReveal>

      <BioSection />
      <TimelineSection />
      <RightNowSection />
    </main>
  );
}
