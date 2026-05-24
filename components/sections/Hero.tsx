"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useAudio } from "@/components/providers/AudioProvider";

const ROLES: { role: string; progression: string }[] = [
  { role: "Data Scientist",            progression: "origin."     },
  { role: "Generative AI Engineer",    progression: "evolution."  },
  { role: "Forward Deployed Engineer", progression: "trajectory." },
];

export function Hero() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { playSound } = useAudio();

  const lineTransition = (delay: number) => ({
    duration: 0.8,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    delay,
  });

  const lineInitial = prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 };
  const fadeInitial = prefersReducedMotion ? { opacity: 1 } : { opacity: 0 };

  return (
    <section
      className="relative flex items-center min-h-screen"
      style={{ isolation: "isolate" }}
    >
      <div
        className="container relative w-full"
        style={{
          paddingTop: "clamp(6rem, 12vw, 8rem)",
          paddingBottom: "clamp(4rem, 8vw, 6rem)",
          zIndex: 1,
        }}
      >
        <div
          className="mx-auto md:mx-0 text-center md:text-left"
          style={{ maxWidth: 820 }}
        >
          {ROLES.map(({ role, progression }, i) => (
            <motion.div
              key={role}
              initial={lineInitial}
              animate={{ opacity: 1, y: 0 }}
              transition={lineTransition(0.1 + i * 0.15)}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.8rem, 5.5vw, 4.2rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              <span
                style={{
                  color: "var(--color-text-primary)",
                  fontWeight: 500,
                }}
              >
                {role}
              </span>
              <span
                style={{
                  color: "var(--color-text-muted)",
                  fontWeight: 300,
                  fontStyle: "normal",
                }}
              >
                {" by "}
              </span>
              <span
                style={{
                  color: "var(--color-brand)",
                  opacity: 0.85,
                  fontWeight: 300,
                  fontStyle: "italic",
                }}
              >
                {progression}
              </span>
            </motion.div>
          ))}

          <motion.p
            initial={fadeInitial}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.6 }}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
              color: "var(--color-text-muted)",
              lineHeight: 1.75,
              maxWidth: 560,
              fontWeight: 400,
              letterSpacing: "0.01em",
              marginTop: "clamp(2rem, 4vw, 3rem)",
            }}
            className="mx-auto md:mx-0"
          >
            I work at the intersection of AI research prototypes, production systems, and human chaos.
          </motion.p>

          <motion.div
            initial={fadeInitial}
            animate={{ opacity: prefersReducedMotion ? 0.45 : 0.45 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.9 }}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              fontWeight: 400,
              marginTop: "1rem",
            }}
          >
            From data science to deployed intelligence.
          </motion.div>

          <motion.div
            initial={fadeInitial}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 1.1 }}
            className="flex flex-wrap gap-4 justify-center md:justify-start"
            style={{ marginTop: "clamp(2.5rem, 5vw, 3.5rem)" }}
          >
            <Link
              href="/lab"
              onClick={() => playSound("click")}
              className="hero-cta-primary"
              style={{
                background: "var(--color-brand)",
                color: "#FFFFFF",
                padding: "0.75rem 1.75rem",
                borderRadius: 6,
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 500,
                letterSpacing: "0.02em",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 200ms ease",
              }}
            >
              View the Lab
            </Link>
            <Link
              href="/signal"
              onClick={() => playSound("click")}
              className="hero-cta-secondary"
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
                padding: "0.75rem 1.75rem",
                borderRadius: 6,
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 500,
                letterSpacing: "0.02em",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 200ms ease",
              }}
            >
              Read Signal
            </Link>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .hero-cta-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(234, 88, 12, 0.25);
        }
        .hero-cta-secondary:hover {
          border-color: var(--color-brand) !important;
          color: var(--color-brand) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  );
}
