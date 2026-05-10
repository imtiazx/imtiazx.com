"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Globe, Code2, Play, FileText } from "lucide-react";
import type { Project, ProjectLinks } from "@/lib/projects";
import { useAudio } from "@/components/providers/AudioProvider";
import { StatusBadge } from "./StatusBadge";
import { ChipTag } from "./ChipTag";

interface ProjectCardProps {
  project: Project;
}

type LinkKey = keyof ProjectLinks;

const LINK_SPEC: { key: LinkKey; label: string; icon: React.ReactNode }[] = [
  { key: "live",    label: "Live",    icon: <Globe size={13} /> },
  { key: "code",    label: "Code",    icon: <Code2 size={13} /> },
  { key: "demo",    label: "Demo",    icon: <Play size={13} /> },
  { key: "article", label: "Article", icon: <FileText size={13} /> },
];

export function ProjectCard({ project }: ProjectCardProps) {
  const { playSound } = useAudio();
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => { setHovered(true); playSound("hover"); }}
      onHoverEnd={() => setHovered(false)}
      animate={{ y: hovered && !prefersReducedMotion ? -4 : 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: hovered ? "var(--color-brand)" : "var(--color-border)",
        boxShadow: hovered ? `0 8px 30px var(--color-brand-light)` : "none",
      }}
      className="relative flex flex-col h-full rounded-xl border overflow-hidden transition-[border-color,box-shadow] duration-200"
    >
      {/* Accent bar */}
      <div
        style={{ backgroundColor: project.accentColor }}
        className="h-[3px] w-full shrink-0"
      />

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Title + badge */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <h3
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}
            className="text-xl leading-tight"
          >
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        {/* Subtitle */}
        <p
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
          className="text-sm leading-snug line-clamp-1 shrink-0"
        >
          {project.subtitle}
        </p>

        {/* Description: fixed 4-line area */}
        <div className="shrink-0 h-[91px] overflow-hidden">
          <p
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
            className="text-sm leading-relaxed line-clamp-4"
          >
            {project.description}
          </p>
        </div>

        {/* Tags: max 2 rows */}
        <div className="shrink-0 max-h-[3.25rem] overflow-hidden">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <ChipTag key={tag} label={tag} />
            ))}
          </div>
        </div>

        {/* Spacer pushes links to bottom */}
        <div className="flex-1" />

        {/* Links row: always rendered, phantom placeholders for missing links */}
        <div className="flex flex-wrap gap-2 pt-1 shrink-0">
          {LINK_SPEC.map(({ key, label, icon }) => {
            const href = project.links[key];
            return href ? (
              <GhostLink
                key={key}
                href={href}
                label={label}
                icon={icon}
                onActivate={() => playSound("click")}
              />
            ) : (
              <span
                key={key}
                style={{ fontFamily: "var(--font-mono)", borderColor: "var(--color-border)" }}
                className="invisible inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px]"
                aria-hidden
              >
                {icon}
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

interface GhostLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  onActivate: () => void;
}

function GhostLink({ href, label, icon, onActivate }: GhostLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onActivate}
      style={{
        fontFamily: "var(--font-mono)",
        color: "var(--color-text-secondary)",
        borderColor: "var(--color-border)",
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] bg-transparent transition-colors duration-150 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
    >
      {icon}
      {label}
    </a>
  );
}
