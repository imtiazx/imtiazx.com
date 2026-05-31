"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
// Lucide dropped its brand icons, so there is no Github glyph in this version;
// Code2 (the </> mark) is the closest match for the "Code" repo link.
import { ExternalLink, Code2, Play, BookOpen } from "lucide-react";
import type { Project, ProjectLinks } from "@/lib/projects";
import { StatusBadge } from "./StatusBadge";
import { ChipTag } from "./ChipTag";

interface ProjectCardProps {
  project: Project;
}

type LinkKey = keyof ProjectLinks;

// Left to right by importance: Live | Code | Trailer | Docs.
const LINK_SPEC: { key: LinkKey; label: string; icon: React.ReactNode }[] = [
  { key: "live",    label: "Live",    icon: <ExternalLink size={13} /> },
  { key: "code",    label: "Code",    icon: <Code2        size={13} /> },
  { key: "trailer", label: "Trailer", icon: <Play         size={13} /> },
  { key: "docs",    label: "Docs",    icon: <BookOpen     size={13} /> },
];

const LINK_BASE =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px]";

export function ProjectCard({ project }: ProjectCardProps) {
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
      className="group flex flex-col h-full p-6 border transition-[border-color,box-shadow] duration-200"
    >
      {/* Status badge — top-left like PostCard category chip. Glows rhythmically
          while the card is hovered (animation defined in globals.css). */}
      <div className="mb-3 shrink-0">
        <StatusBadge
          status={project.status}
          className="group-hover:animate-[statusGlow_1.2s_ease-in-out_infinite_alternate]"
        />
      </div>

      {/* Title */}
      <h3
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}
        className="text-xl leading-snug mb-2 shrink-0"
      >
        {project.title}
      </h3>

      {/* Subtitle */}
      <p
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
        className="text-[13px] leading-snug line-clamp-1 mb-3 shrink-0"
      >
        {project.subtitle}
      </p>

      {/* Description: fixed 4-line area matching PostCard's fixed-height approach */}
      <div className="h-[88px] overflow-hidden shrink-0">
        <p
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
          className="text-sm leading-relaxed line-clamp-4"
        >
          {project.description}
        </p>
      </div>

      {/* Tags: max 2 rows */}
      <div className="mt-3 max-h-[3.25rem] overflow-hidden shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <ChipTag key={tag} label={tag} />
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-[0.75rem]" />

      {/* Action links row — Live | Code | Trailer | Docs. All four are always
          visible; unavailable ones are greyed out, never hidden. */}
      <div
        className="pt-4 mt-4 shrink-0"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex flex-wrap gap-2">
          {LINK_SPEC.map(({ key, label, icon }) => {
            const href = project.links[key];
            return href ? (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-text-muted)",
                  borderColor: "var(--color-border)",
                }}
                className={`${LINK_BASE} bg-transparent transition-colors duration-150 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]`}
              >
                {icon}
                {label}
              </a>
            ) : (
              <span
                key={key}
                aria-disabled
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-text-muted)",
                  borderColor: "var(--color-border)",
                }}
                className={`${LINK_BASE} opacity-40 cursor-not-allowed pointer-events-none`}
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
