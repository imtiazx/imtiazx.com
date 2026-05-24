"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { person } from "@/lib/person";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

interface ParsedMetric {
  raw: string;
  prefix: string;
  suffix: string;
  target: number | null;
}

// Splits "~5" -> { prefix: "~", target: 5, suffix: "" }
// Splits "75%" -> { prefix: "", target: 75, suffix: "%" }
// Splits "25+" -> { prefix: "", target: 25, suffix: "+" }
// "3rd" returns target: null -> scramble branch
function parseMetric(raw: string): ParsedMetric {
  const match = raw.match(/^([^\d]*)(\d+(?:\.\d+)?)([^\d]*)$/);
  if (!match) return { raw, prefix: raw, suffix: "", target: null };
  const [, prefix, num, suffix] = match;
  const n = Number(num);
  if (Number.isNaN(n)) return { raw, prefix: raw, suffix: "", target: null };
  return { raw, prefix, suffix, target: n };
}

export function MetricsBar() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const playedRef = useRef(false);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const parsed = person.metrics.map((m) => parseMetric(m.value));

    if (prefersReducedMotion) {
      parsed.forEach((p, i) => {
        const node = valueRefs.current[i];
        if (node) node.textContent = p.raw;
      });
      return;
    }

    parsed.forEach((p, i) => {
      const node = valueRefs.current[i];
      if (!node) return;
      if (p.target === null) {
        node.textContent = "???";
      } else {
        node.textContent = `${p.prefix}0${p.suffix}`;
      }
    });

    const trigger = () => {
      if (playedRef.current) return;
      playedRef.current = true;

      parsed.forEach((p, i) => {
        const node = valueRefs.current[i];
        if (!node) return;

        if (p.target === null) {
          gsap.to(node, {
            duration: 1.2,
            delay: i * 0.2,
            scrambleText: {
              text: p.raw,
              chars: "0123456789abcdefghijklmnopqrstuvwxyz",
              speed: 0.5,
              revealDelay: 0,
              tweenLength: false,
            },
            ease: "none",
          });
          return;
        }

        const counter = { v: 0 };
        gsap.to(counter, {
          v: p.target,
          duration: 1.5,
          delay: i * 0.2,
          ease: "power2.out",
          onUpdate: () => {
            const current = Math.round(counter.v);
            node.textContent = `${p.prefix}${current}${p.suffix}`;
          },
          onComplete: () => {
            node.textContent = p.raw;
          },
        });
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            trigger();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="py-14">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {person.metrics.map((metric, i) => (
            <div
              key={metric.label}
              style={{ borderColor: "var(--color-border)" }}
              className={`flex flex-col items-center text-center gap-2 py-6 px-4 md:px-8 ${
                i < person.metrics.length - 1 ? "md:border-r" : ""
              }`}
            >
              <span
                ref={(el) => {
                  valueRefs.current[i] = el;
                }}
                style={{ fontFamily: "var(--font-serif)", color: "var(--color-brand)" }}
                className="text-4xl md:text-5xl tabular-nums"
              >
                {metric.value}
              </span>
              <span
                style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
                className="text-sm leading-snug"
              >
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
