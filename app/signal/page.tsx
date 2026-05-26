"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { posts, type PostCategory } from "@/lib/posts";
import { opinions, type Opinion } from "@/lib/opinions";
import { PostCard } from "@/components/ui/PostCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useAudio } from "@/components/providers/AudioProvider";

type Tab = "articles" | "perspectives";
type ArticleFilter = "All" | PostCategory;

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "articles", label: "Articles" },
  { id: "perspectives", label: "Perspectives" },
];

const ARTICLE_FILTERS: Array<{ id: ArticleFilter; label: string }> = [
  { id: "All", label: "All" },
  { id: "technical", label: "Technical" },
  { id: "responsible-ai", label: "Responsible AI" },
  { id: "strategy", label: "Strategy" },
  { id: "research", label: "Research" },
];

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--font-sans)",
        color: active ? "var(--color-brand)" : "var(--color-text-muted)",
        borderBottom: active ? "2px solid var(--color-brand)" : "2px solid transparent",
      }}
      className="px-1 pb-2 text-sm md:text-base font-medium transition-colors duration-150 hover:text-[var(--color-brand)]"
    >
      {label}
    </button>
  );
}

function PillButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--font-sans)",
        color: active ? "var(--color-brand)" : "var(--color-text-muted)",
        backgroundColor: active ? "var(--color-brand-light)" : "transparent",
        borderColor: active ? "var(--color-brand)" : "var(--color-border)",
      }}
      className="border rounded-full px-3 py-1 text-[12px] transition-colors duration-150 hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]"
    >
      {label}
    </button>
  );
}

function ArticlesTab() {
  const [filter, setFilter] = useState<ArticleFilter>("All");

  const filtered = useMemo(
    () => (filter === "All" ? posts : posts.filter((p) => p.category === filter)),
    [filter],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {ARTICLE_FILTERS.map((f) => (
          <PillButton
            key={f.id}
            label={f.label}
            active={filter === f.id}
            onClick={() => setFilter(f.id)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
          className="text-sm italic"
        >
          No posts in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// Intentionally fixed dark card surface regardless of theme (matches PerspectivesSection).
function OpinionFullCard({ opinion }: { opinion: Opinion }) {
  const { playSound } = useAudio();
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const hasUrl = opinion.url !== "#";

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={prefersReducedMotion ? {} : { y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        backgroundColor: "#2A1F1A",
        borderColor: hovered ? "var(--color-brand)" : "#3D2E28",
        boxShadow: hovered ? "0 8px 24px rgba(234, 88, 12, 0.18)" : "none",
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
          fontSize: 18,
          lineHeight: 1.35,
        }}
        className="mt-6 shrink-0 relative z-10"
      >
        {opinion.title}
      </h3>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          color: "#A8A29E",
          fontSize: 14,
          lineHeight: 1.6,
        }}
        className="mt-3 flex-1 relative z-10"
      >
        {opinion.oneliner}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5 relative z-10">
        {opinion.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "var(--font-sans)",
              color: "#A8A29E",
              borderColor: "#3D2E28",
            }}
            className="inline-block border rounded px-2 py-0.5 text-[10px]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div
        className="mt-5 pt-4 flex items-center justify-between gap-2 shrink-0 relative z-10"
        style={{ borderTop: "1px solid #3D2E28" }}
      >
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

        {hasUrl ? (
          <a
            href={opinion.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound("click")}
            style={{ color: "#A8A29E", fontFamily: "var(--font-sans)" }}
            className="inline-flex items-center gap-1.5 text-[12px] transition-colors duration-150 hover:text-[var(--color-brand)]"
          >
            {opinion.platform}
            <ExternalLink size={13} />
          </a>
        ) : (
          <span
            style={{ color: "#6B5E57", fontFamily: "var(--font-sans)" }}
            className="text-[10px] uppercase tracking-wider"
          >
            Unpublished
          </span>
        )}
      </div>
    </motion.div>
  );
}

function PerspectivesTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {opinions.map((o) => (
        <OpinionFullCard key={o.id} opinion={o} />
      ))}
    </div>
  );
}

export default function SignalPage() {
  const [tab, setTab] = useState<Tab>("articles");
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="container py-20">
      <ScrollReveal variant="fadeUp">
        <h1
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
          className="text-4xl md:text-5xl lg:text-6xl"
        >
          Signal
        </h1>
      </ScrollReveal>
      <ScrollReveal variant="fadeUp" delay={0.05}>
        <p
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
          className="mt-3 text-base md:text-lg max-w-2xl"
        >
          Articles and perspectives worth reading.
        </p>
      </ScrollReveal>

      <div
        className="mt-10 flex flex-wrap gap-6 md:gap-8"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        {TABS.map((t) => (
          <TabButton
            key={t.id}
            label={t.label}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
          />
        ))}
      </div>

      <div className="mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {tab === "articles" && <ArticlesTab />}
            {tab === "perspectives" && <PerspectivesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
