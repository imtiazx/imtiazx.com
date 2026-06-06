"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { projects, type ProjectStatus } from "@/lib/projects";
import { hackathons, type Hackathon } from "@/lib/hackathons";
import { albums, standalones } from "@/lib/experiments";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ChipTag } from "@/components/ui/ChipTag";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ExperimentAlbum } from "@/components/ui/ExperimentAlbum";
import { ExperimentStandaloneCard } from "@/components/ui/ExperimentStandaloneCard";

type Tab = "projects" | "hackathons" | "experiments";
type ProjectFilter = "All" | ProjectStatus;

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "projects", label: "Projects" },
  { id: "hackathons", label: "Hackathons" },
  { id: "experiments", label: "Experiment" },
];

const VALID_TAB_IDS = new Set<Tab>(TABS.map((t) => t.id));
const DEFAULT_TAB: Tab = "projects";

function parseTab(value: string | null): Tab {
  return value && VALID_TAB_IDS.has(value as Tab) ? (value as Tab) : DEFAULT_TAB;
}

const PROJECT_FILTERS: ProjectFilter[] = ["All", "Production", "Development", "Ideation"];

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

function HackathonDetailCard({ h }: { h: Hackathon }) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const isActive = h.status === "Active";

  return (
    <motion.article
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
      className="flex flex-col p-6 md:p-8 border transition-[border-color,box-shadow] duration-200"
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {isActive ? (
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
        ) : (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-amber)",
              backgroundColor: "var(--color-amber-light)",
            }}
            className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"
          >
            COMPLETED
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            borderColor: "var(--color-brand)",
            color: "var(--color-brand)",
          }}
          className="inline-block border rounded px-2 py-0.5 text-[11px] uppercase tracking-wider"
        >
          {h.platform}
        </span>
        <span
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
          className="text-[11px] uppercase tracking-wider"
        >
          Updated {h.updatedAt}
        </span>
      </div>

      <h3
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
        className="text-2xl md:text-3xl leading-snug mb-4"
      >
        {h.name}
      </h3>

      {isActive && typeof h.rank === "number" && (
        <div className="mb-4">
          <div
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-brand)", fontSize: 48, lineHeight: 1 }}
          >
            #{h.rank}
          </div>
          <div
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", fontSize: 11 }}
            className="mt-1 uppercase tracking-wider"
          >
            Public leaderboard rank
          </div>
        </div>
      )}

      {!isActive && h.placement && (
        <div
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-brand)" }}
          className="text-3xl md:text-4xl leading-tight mb-4"
        >
          {h.placement}
        </div>
      )}

      <p
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
        className="text-base leading-relaxed mb-5 max-w-prose"
      >
        {h.description}
      </p>

      <div className="mb-6">
        <div className="flex flex-wrap gap-1.5">
          {h.tags.map((tag) => (
            <ChipTag key={tag} label={tag} />
          ))}
        </div>
      </div>

      <div
        className="pt-4 mt-auto"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        {h.competitionUrl ? (
          <a
            href={h.competitionUrl}
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
            View competition
          </a>
        ) : (
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
            View competition
          </span>
        )}
      </div>
    </motion.article>
  );
}

function ProjectsTab() {
  const [filter, setFilter] = useState<ProjectFilter>("All");

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.status === filter)),
    [filter],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {PROJECT_FILTERS.map((f) => (
          <PillButton
            key={f}
            label={f}
            active={filter === f}
            onClick={() => setFilter(f)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
          className="text-sm italic"
        >
          No projects in this status yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function HackathonsTab() {
  const active = hackathons.filter((h) => h.status === "Active");
  const completed = hackathons.filter((h) => h.status === "Completed");

  return (
    <div className="flex flex-col gap-12">
      {active.length > 0 && (
        <section>
          <h2
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
            className="text-xs uppercase tracking-widest mb-5"
          >
            Active
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {active.map((h) => (
              <HackathonDetailCard key={h.id} h={h} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
            className="text-xs uppercase tracking-widest mb-5"
          >
            Completed
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {completed.map((h) => (
              <HackathonDetailCard key={h.id} h={h} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ExperimentsTab() {
  return (
    <div className="flex flex-col gap-12">
      {albums.map((album) => (
        <ExperimentAlbum key={album.id} album={album} />
      ))}
      {standalones.map((exp) => (
        <ExperimentStandaloneCard key={exp.id} experiment={exp} />
      ))}
    </div>
  );
}

function LabTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const [tab, setTabState] = useState<Tab>(() =>
    parseTab(searchParams.get("tab")),
  );

  const setTab = useCallback(
    (next: Tab) => {
      setTabState(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === DEFAULT_TAB) params.delete("tab");
      else params.set("tab", next);
      const qs = params.toString();
      // scroll: false keeps the user where they were when toggling tabs.
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <>
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
            {tab === "projects" && <ProjectsTab />}
            {tab === "hackathons" && <HackathonsTab />}
            {tab === "experiments" && <ExperimentsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default function LabPage() {
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
          Lab
        </h1>
      </ScrollReveal>
      <ScrollReveal variant="fadeUp" delay={0.05}>
        <p
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
          className="mt-3 text-base md:text-lg max-w-2xl"
        >
          Everything I build, compete in, and ship.
        </p>
      </ScrollReveal>

      {/* useSearchParams forces dynamic rendering up to the closest Suspense
          boundary; this keeps the header static while only the tab UI hydrates
          off the URL. */}
      <Suspense fallback={null}>
        <LabTabs />
      </Suspense>
    </main>
  );
}
