"use client";

import { ReactNode, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Variant = "fadeUp" | "fadeIn" | "wordReveal" | "scramble";

interface Props {
  variant: Variant;
  delay?: number;
  children: ReactNode;
  className?: string;
}

export function ScrollReveal({ variant, delay = 0, children, className }: Props) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  if (variant === "fadeUp") {
    return (
      <motion.div
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 40, filter: "blur(8px)" }
        }
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  if (variant === "fadeIn") {
    return (
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  if (variant === "wordReveal") {
    return (
      <WordReveal delay={delay} className={className} reduced={prefersReducedMotion}>
        {children}
      </WordReveal>
    );
  }

  return (
    <Scramble delay={delay} className={className} reduced={prefersReducedMotion}>
      {children}
    </Scramble>
  );
}

function firstTextElement(root: HTMLElement): HTMLElement {
  return (root.querySelector("h1, h2, h3, h4, h5, h6, p, span") as HTMLElement | null) ?? root;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Reveal each word with a stagger. Replaces the target element's text with
 * span-wrapped words on mount, hides them, and toggles them visible when the
 * container scrolls into view. Uses inline transitions instead of GSAP
 * SplitText (paid plugin) so no license risk.
 */
function WordReveal({
  children,
  delay,
  className,
  reduced,
}: {
  children: ReactNode;
  delay: number;
  className?: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const root = ref.current;
    if (!root) return;
    const target = firstTextElement(root);
    const original = target.textContent ?? "";
    if (!original.trim()) return;

    // Split on whitespace while preserving the whitespace runs themselves, so
    // the text rewraps identically to the original.
    const tokens = original.split(/(\s+)/);
    const baseDelayMs = delay * 1000;
    const stepMs = 80;

    target.innerHTML = tokens
      .map((tok, i) => {
        if (/^\s+$/.test(tok)) return tok;
        const d = baseDelayMs + i * stepMs;
        return `<span class="sr-word" style="display:inline-block;opacity:0;transform:translateY(30px);filter:blur(8px);transition:opacity 700ms ease ${d}ms,transform 700ms ease ${d}ms,filter 700ms ease ${d}ms;">${escapeHtml(tok)}</span>`;
      })
      .join("");

    const wordEls = Array.from(
      target.querySelectorAll<HTMLSpanElement>(".sr-word"),
    );

    let played = false;
    const reveal = () => {
      if (played) return;
      played = true;
      // Trigger the transitions on the next frame so the initial styles
      // commit first.
      requestAnimationFrame(() => {
        for (const el of wordEls) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          el.style.filter = "blur(0px)";
        }
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            io.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      // Restore the original plain text so React's reconciliation sees a
      // matching subtree on re-render.
      target.textContent = original;
    };
  }, [delay, reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Tiny home-rolled scramble: cycles random glyphs in each character slot, then
 * locks the real character left-to-right over the duration. Replaces the GSAP
 * ScrambleTextPlugin (paid) so no license risk.
 */
function Scramble({
  children,
  delay,
  className,
  reduced,
}: {
  children: ReactNode;
  delay: number;
  className?: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const root = ref.current;
    if (!root) return;
    const target = firstTextElement(root);
    const original = target.textContent ?? "";
    if (!original.trim()) return;

    const CHARS = "01!@#$%^&*";
    const DURATION_MS = 1000;
    let played = false;
    let rafId = 0;
    let cancelled = false;

    const trigger = () => {
      if (played) return;
      played = true;
      const startAt = performance.now() + delay * 1000;

      const step = () => {
        if (cancelled) return;
        const now = performance.now();
        if (now < startAt) {
          rafId = requestAnimationFrame(step);
          return;
        }
        const t = Math.min(1, (now - startAt) / DURATION_MS);
        let out = "";
        const lockedThrough = Math.floor(t * original.length);
        for (let i = 0; i < original.length; i++) {
          const c = original[i];
          if (i < lockedThrough || c === " " || c === "\n" || c === "\t") {
            out += c;
          } else {
            out += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        target.textContent = out;
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          // Final reveal: ensure exact original text after the animation
          // ends (avoid any rounding from the lockedThrough math).
          target.textContent = original;
        }
      };
      rafId = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            trigger();
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(root);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      target.textContent = original;
    };
  }, [delay, reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
