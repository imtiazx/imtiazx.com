"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Fixed black/white penguin fills regardless of theme (matches EarthSection's Tux).
function TuxStatic() {
  return (
    <svg
      width="80"
      height="100"
      viewBox="-32 -60 64 100"
      role="img"
      aria-label="Tux"
      style={{ display: "block" }}
    >
      <ellipse cx="-22" cy="-2" rx="6" ry="18" fill="#0A0A0A" transform="rotate(-10 -22 -2)" />
      <ellipse cx="22" cy="-2" rx="6" ry="18" fill="#0A0A0A" transform="rotate(10 22 -2)" />

      <ellipse cx="0" cy="0" rx="24" ry="34" fill="#0A0A0A" />
      <ellipse cx="0" cy="4" rx="14" ry="24" fill="#FFFFFF" />

      <rect x="-9" y="30" width="7" height="5" rx="2" fill="var(--color-brand)" />
      <rect x="2" y="30" width="7" height="5" rx="2" fill="var(--color-brand)" />

      <circle cx="0" cy="-38" r="20" fill="#0A0A0A" />
      <ellipse cx="0" cy="-37" rx="13" ry="10" fill="#FFFFFF" />

      <circle cx="-6" cy="-40" r="4" fill="#FFFFFF" />
      <circle cx="-5.5" cy="-39.5" r="2.2" fill="#0A0A0A" />
      <circle cx="-5" cy="-41" r="0.9" fill="#FFFFFF" />

      <circle cx="6" cy="-40" r="4" fill="#FFFFFF" />
      <circle cx="6.5" cy="-39.5" r="2.2" fill="#0A0A0A" />
      <circle cx="7" cy="-41" r="0.9" fill="#FFFFFF" />

      <polygon points="0,-32 8,-30 0,-28" fill="var(--color-brand)" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <section
      className="container relative flex flex-col items-center justify-center text-center"
      style={{ minHeight: "calc(100vh - 56px)", paddingTop: "5rem", paddingBottom: "5rem" }}
    >
      <span
        aria-hidden
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-brand)",
          opacity: 0.15,
          fontSize: "8rem",
          lineHeight: 1,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        404
      </span>

      <div className="relative z-10 flex flex-col items-center">
        <ScrollReveal variant="fadeUp">
          <TuxStatic />
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" delay={0.05}>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-primary)",
              fontSize: "2rem",
              lineHeight: 1.15,
            }}
            className="mt-6"
          >
            Lost in the stack.
          </h1>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" delay={0.1}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-muted)",
            }}
            className="mt-4 max-w-md text-base leading-relaxed"
          >
            This page doesn&apos;t exist. The penguin looked everywhere.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" delay={0.15}>
          <Link
            href="/lab"
            style={{
              backgroundColor: "var(--color-brand)",
              color: "#FFFFFF",
              fontFamily: "var(--font-sans)",
            }}
            className="mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5"
          >
            Back to Lab
            <ArrowRight size={15} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
