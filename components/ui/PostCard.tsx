"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Post, PostCategory } from "@/lib/posts";

interface PostCardProps {
  post: Post;
}

type CategoryConfig = {
  label: string;
  color: string;
  bg: string;
};

const categoryConfig: Record<PostCategory, CategoryConfig> = {
  technical: {
    label: "Technical",
    color: "var(--color-blue)",
    bg: "var(--color-blue-light)",
  },
  "responsible-ai": {
    label: "Responsible AI",
    color: "var(--color-coral)",
    bg: "var(--color-coral-light)",
  },
  strategy: {
    label: "Strategy",
    color: "var(--color-green)",
    bg: "var(--color-green-light)",
  },
  research: {
    label: "Research",
    color: "var(--color-amber)",
    bg: "var(--color-amber-light)",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function PostCard({ post }: PostCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const config = categoryConfig[post.category];

  return (
    <a
      href={`https://blog.imtiaz.dev/${post.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "var(--color-surface)" : "transparent",
        borderColor: "var(--color-border)",
      }}
      className="flex flex-col gap-3 p-5 rounded-xl border transition-colors duration-200"
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          color: config.color,
          backgroundColor: config.bg,
        }}
        className="self-start inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium"
      >
        {config.label}
      </span>

      <h3
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--color-text-primary)",
        }}
        className="text-xl leading-snug"
      >
        {post.title}
      </h3>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-muted)",
        }}
        className="text-sm leading-relaxed flex-1"
      >
        {post.excerpt}
      </p>

      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
          }}
          className="text-[11px]"
        >
          {formatDate(post.publishedAt)}
        </span>

        <span
          style={{
            color: hovered ? "var(--color-purple)" : "var(--color-text-muted)",
            transition: "color 150ms ease",
            display: "flex",
          }}
        >
          <motion.span
            animate={{ x: hovered && !prefersReducedMotion ? 4 : 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ display: "flex" }}
          >
            <ArrowRight size={16} />
          </motion.span>
        </span>
      </div>
    </a>
  );
}
