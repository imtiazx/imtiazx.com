"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Code2, Play, FileText } from "lucide-react";
import type { Project } from "@/lib/projects";
import { useAudio } from "@/components/providers/AudioProvider";
import { StatusBadge } from "./StatusBadge";
import { ChipTag } from "./ChipTag";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { playSound } = useAudio();
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const handleHoverStart = () => {
    setHovered(true);
    playSound("hover");
  };

  const handleHoverEnd = () => {
    setHovered(false);
  };

  const hasLinks = Object.values(project.links).some(Boolean);

  return (
    <motion.div
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      animate={{ y: hovered && !prefersReducedMotion ? -4 : 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: hovered ? project.accentColor : "var(--color-border)",
        boxShadow: hovered ? "0 8px 30px rgba(0,0,0,0.12)" : "none",
      }}
      className="relative flex flex-col rounded-xl border overflow-hidden transition-[border-color,box-shadow] duration-200"
    >
      <div
        style={{ backgroundColor: project.accentColor }}
        className="h-1 w-full shrink-0"
      />

      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-text-primary)",
            }}
            className="text-xl leading-tight"
          >
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-secondary)",
          }}
          className="text-sm"
        >
          {project.subtitle}
        </p>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-muted)",
          }}
          className="text-sm leading-relaxed line-clamp-3 flex-1"
        >
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <ChipTag key={tag} label={tag} />
          ))}
        </div>

        {hasLinks && (
          <div className="flex flex-wrap gap-2 pt-1">
            {project.links.live && (
              <GhostLink
                href={project.links.live}
                label="Live"
                icon={<ExternalLink size={13} />}
                onActivate={() => playSound("click")}
              />
            )}
            {project.links.code && (
              <GhostLink
                href={project.links.code}
                label="Code"
                icon={<Code2 size={13} />}
                onActivate={() => playSound("click")}
              />
            )}
            {project.links.demo && (
              <GhostLink
                href={project.links.demo}
                label="Demo"
                icon={<Play size={13} />}
                onActivate={() => playSound("click")}
              />
            )}
            {project.links.article && (
              <GhostLink
                href={project.links.article}
                label="Article"
                icon={<FileText size={13} />}
                onActivate={() => playSound("click")}
              />
            )}
          </div>
        )}
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] bg-transparent transition-colors duration-150 hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
    >
      {icon}
      {label}
    </a>
  );
}
