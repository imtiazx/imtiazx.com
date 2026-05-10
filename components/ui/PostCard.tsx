"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/lib/posts";
import { person } from "@/lib/person";

interface PostCardProps {
  post: Post;
}

const categoryLabel: Record<Post["category"], string> = {
  technical: "Technical",
  "responsible-ai": "Responsible AI",
  strategy: "Strategy",
  research: "Research",
};

export function PostCard({ post }: PostCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`${person.social.hashnode}/${post.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "var(--color-surface)" : "transparent",
        borderColor: "var(--color-border)",
      }}
      className="flex flex-col h-full p-5 rounded-xl border transition-colors duration-200"
    >
      {/* Category chip */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-brand)",
          backgroundColor: "var(--color-brand-light)",
        }}
        className="self-start inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium mb-3 shrink-0"
      >
        {categoryLabel[post.category]}
      </span>

      {/* Title */}
      <h3
        style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}
        className="text-xl leading-snug mb-3 shrink-0"
      >
        {post.title}
      </h3>

      {/* Excerpt: fixed 3-line area */}
      <div className="h-[63px] overflow-hidden shrink-0">
        <p
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
          className="text-sm leading-relaxed line-clamp-3"
        >
          {post.excerpt}
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Read link pinned to bottom */}
      <div
        className="flex items-center justify-between pt-4 mt-4 shrink-0"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <span
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-brand)" }}
          className="text-[12px] font-medium"
        >
          Read on Hashnode
        </span>
        <span
          style={{
            color: hovered ? "var(--color-brand)" : "var(--color-text-muted)",
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
