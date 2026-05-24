"use client";

import { ReactNode, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, ScrambleTextPlugin);
}

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

    let played = false;
    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = new SplitText(target, { type: "words" });
      gsap.set(split.words, { opacity: 0, y: 30, filter: "blur(8px)" });

      const trigger = () => {
        if (played || !split) return;
        played = true;
        gsap.to(split.words, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          stagger: 0.08,
          duration: 0.7,
          ease: "power3.out",
          delay,
        });
      };

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              trigger();
              io.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );
      io.observe(root);
      ctx.add(() => io.disconnect());
    }, root);

    return () => {
      split?.revert();
      ctx.revert();
    };
  }, [delay, reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

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
    const root = ref.current;
    if (!root) return;
    const target = firstTextElement(root);
    const original = target.textContent ?? "";

    if (reduced) return;

    let played = false;
    const ctx = gsap.context(() => {
      const trigger = () => {
        if (played) return;
        played = true;
        gsap.to(target, {
          duration: 1,
          delay,
          scrambleText: {
            text: original,
            chars: "01!@#$%^&*",
            speed: 0.4,
            revealDelay: 0,
            tweenLength: false,
          },
          ease: "none",
        });
      };

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              trigger();
              io.disconnect();
            }
          });
        },
        { threshold: 0.3 }
      );
      io.observe(root);
      ctx.add(() => io.disconnect());
    }, root);

    return () => {
      ctx.revert();
      target.textContent = original;
    };
  }, [delay, reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
