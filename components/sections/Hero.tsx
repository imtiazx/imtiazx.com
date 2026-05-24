"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useAudio } from "@/components/providers/AudioProvider";
import { OrangeHole } from "@/components/ui/OrangeHole";

interface Role {
  role: string;
  progression: string;
}

const ROLES: Role[] = [
  { role: "Data Scientist",            progression: "origin"     },
  { role: "Generative AI Engineer",    progression: "evolution"  },
  { role: "Forward Deployed Engineer", progression: "trajectory" },
];

const LINE_DELAYS = [0, 1.2, 2.6];
const PHILOSOPHY_DELAY = 3.8;
const CTA_DELAY = 4.2;
const CHAR_STAGGER = 0.025;

const charVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15, ease: "easeOut" as const },
  },
};

function renderChars(text: string, keyPrefix: string) {
  return Array.from(text).map((c, i) => (
    <motion.span
      key={`${keyPrefix}-${i}`}
      variants={charVariants}
      style={{ display: "inline-block", whiteSpace: "pre" }}
    >
      {c === " " ? " " : c}
    </motion.span>
  ));
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { playSound } = useAudio();

  const lineParent = (delay: number) =>
    prefersReducedMotion
      ? { hidden: {}, visible: {} }
      : {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: CHAR_STAGGER,
              delayChildren: delay,
            },
          },
        };

  const fadeInitial = prefersReducedMotion ? { opacity: 1 } : { opacity: 0 };
  const fadeTransition = (delay: number) => ({
    duration: 0.6,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    delay: prefersReducedMotion ? 0 : delay,
  });

  return (
    <section
      className="relative flex items-end md:items-center"
      style={{
        isolation: "isolate",
        position: "relative",
        overflow: "hidden",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <OrangeHole />

      <div
        className="container relative w-full"
        style={{
          paddingTop: "clamp(8rem, 18vw, 14rem)",
          paddingBottom: "clamp(4rem, 8vw, 6rem)",
          zIndex: 10,
        }}
      >
        <div
          className="mx-auto md:mx-0 text-center md:text-left"
          style={{ maxWidth: 820, position: "relative", zIndex: 10 }}
        >
          {ROLES.map(({ role, progression }, lineIdx) => {
            const initial = prefersReducedMotion ? "visible" : "hidden";
            return (
              <motion.div
                key={role}
                variants={lineParent(LINE_DELAYS[lineIdx])}
                initial={initial}
                animate="visible"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.025em",
                  fontFeatureSettings: '"ss01" on, "cv11" on',
                }}
              >
                <span
                  style={{
                    color: "var(--color-text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {renderChars(role, `role-${lineIdx}`)}
                </span>
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    fontWeight: 300,
                  }}
                >
                  {renderChars(" by ", `by-${lineIdx}`)}
                </span>
                <span
                  className="prog-word"
                  style={{
                    color: "var(--color-brand)",
                    opacity: 0.9,
                    fontWeight: 500,
                  }}
                >
                  {renderChars(progression, `prog-${lineIdx}`)}
                </span>
                <motion.span
                  variants={charVariants}
                  style={{
                    color: "var(--color-text-muted)",
                    fontWeight: 300,
                    opacity: 0.6,
                    display: "inline-block",
                  }}
                >
                  .
                </motion.span>
              </motion.div>
            );
          })}

          <motion.p
            initial={fadeInitial}
            animate={{ opacity: 1 }}
            transition={fadeTransition(PHILOSOPHY_DELAY)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.95rem, 1.45vw, 1.125rem)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
              maxWidth: 560,
              fontWeight: 400,
              marginTop: "clamp(2rem, 4vw, 2.75rem)",
            }}
            className="mx-auto md:mx-0"
          >
            I work at the intersection of AI research prototypes, production systems, and human chaos.
          </motion.p>

          <motion.div
            initial={fadeInitial}
            animate={{ opacity: 1 }}
            transition={fadeTransition(CTA_DELAY)}
            className="flex flex-wrap gap-4 justify-center md:justify-start"
            style={{ marginTop: "clamp(2.25rem, 4vw, 3rem)" }}
          >
            <Link
              href="/lab"
              onClick={() => playSound("click")}
              className="hero-cta-primary"
              style={{
                background: "var(--color-brand)",
                color: "#FFFFFF",
                padding: "0.75rem 1.6rem",
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
                padding: "0.75rem 1.6rem",
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
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(234, 88, 12, 0.22);
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
