"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stack, type StackCategory, type StackItem } from "@/lib/stack";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const CATEGORY_ORDER: StackCategory[] = [
  "LLM & AI",
  "Backend",
  "Frontend",
  "Data & Vector",
  "Infrastructure",
];

function ProficiencyBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Proficiency"
      style={{
        backgroundColor: "var(--color-brand-light)",
        borderRadius: 999,
      }}
      className="w-full h-1.5 overflow-hidden"
    >
      <div
        style={{
          width: `${clamped}%`,
          backgroundColor: "var(--color-brand)",
          height: "100%",
          borderRadius: 999,
          transition: "width 400ms ease",
        }}
      />
    </div>
  );
}

function TechCard({ item }: { item: StackItem }) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const hasProficiency = typeof item.proficiency === "number";
  const hasNote = typeof item.note === "string" && item.note.length > 0;

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
        borderRadius: 8,
      }}
      className="flex flex-col p-4 border transition-[border-color,box-shadow] duration-200 h-full"
    >
      <h3
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
        className="text-sm font-semibold leading-snug"
      >
        {item.name}
      </h3>

      {hasProficiency && (
        <div className="mt-3">
          <ProficiencyBar value={item.proficiency as number} />
        </div>
      )}

      {hasNote && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
            fontSize: 11,
            lineHeight: 1.5,
          }}
          className="mt-3"
        >
          {item.note}
        </p>
      )}
    </motion.div>
  );
}

function CategorySection({ category, items }: { category: StackCategory; items: StackItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-14">
      <h2
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
          borderBottom: "2px solid var(--color-brand)",
        }}
        className="inline-block text-2xl md:text-3xl pb-1 mb-6"
      >
        {category}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
        {items.map((item) => (
          <TechCard key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function StackPage() {
  const grouped = useMemo(() => {
    const byCategory: Record<StackCategory, StackItem[]> = {
      "LLM & AI": [],
      Backend: [],
      Frontend: [],
      "Data & Vector": [],
      Infrastructure: [],
    };
    for (const item of stack) {
      byCategory[item.category].push(item);
    }
    return byCategory;
  }, []);

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
          Stack
        </h1>
      </ScrollReveal>
      <ScrollReveal variant="fadeUp" delay={0.05}>
        <p
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
          className="mt-3 text-base md:text-lg max-w-2xl"
        >
          Tools I actually use, not just tools I list.
        </p>
      </ScrollReveal>

      <div className="mt-12">
        {CATEGORY_ORDER.map((category) => (
          <CategorySection key={category} category={category} items={grouped[category]} />
        ))}
      </div>
    </main>
  );
}
