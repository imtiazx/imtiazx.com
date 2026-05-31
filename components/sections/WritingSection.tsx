"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  ShieldAlert,
  Rocket,
  Gauge,
  Bot,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { posts } from "@/lib/posts";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import WritingsCpuLoop, {
  type CpuLoopItem,
} from "@/components/ui/WritingsCpuLoop";

const HEADING = "What I Write";
const SUBTEXT =
  "Technical writing, architecture breakdowns, production AI essays, research thinking.";

// Per-post icon keyed by id. Each glyph maps to the piece's subject so the
// die-perimeter nodes read at a glance.
const POST_ICONS: Record<string, LucideIcon> = {
  "rag-production": Database,
  "red-teaming-enterprise-llms": ShieldAlert,
  "why-enterprise-ai-fails": Rocket,
  "beyond-benchmarks": Gauge,
  "agentic-pipelines-production": Bot,
};

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  "responsible-ai": "Responsible AI",
  strategy: "Strategy",
  research: "Research",
};

export function WritingSection() {
  const items = useMemo<CpuLoopItem[]>(
    () =>
      posts.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        category: CATEGORY_LABELS[post.category] ?? post.category,
        icon: POST_ICONS[post.id] ?? FileText,
        href: `/signal#${post.slug}`,
      })),
    [],
  );

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="mb-8">
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

        <WritingsCpuLoop items={items} />

        <div className="mt-8 flex justify-end">
          <Link
            href="/signal"
            style={{ color: "var(--color-brand)", fontFamily: "var(--font-sans)" }}
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all duration-150"
          >
            Read all posts
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
