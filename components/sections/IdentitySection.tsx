"use client";

import { useMemo } from "react";
import {
  BrainCircuit,
  ShieldCheck,
  LineChart,
  Network,
  Compass,
  Target,
  type LucideIcon,
} from "lucide-react";
import { person } from "@/lib/person";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import RadialOrbitalTimeline, {
  type OrbitalItem,
} from "@/components/ui/RadialOrbitalTimeline";

const HEADING = "What I Bring";
const SUBTEXT =
  "Capabilities, engineering range, systems thinking, operational strengths.";

// Per-role icon + related-role graph keyed by title. Keeping this here (instead
// of in lib/person.ts) keeps person.ts free of UI concerns; the section is the
// only place the orbital graph matters.
const ROLE_CONFIG: Record<string, { icon: LucideIcon; relatedTitles: string[] }> = {
  "Data Scientist": {
    icon: LineChart,
    relatedTitles: ["Responsible AI Specialist", "AI Consultant"],
  },
  "System Architect": {
    icon: Network,
    relatedTitles: ["GenAI Engineer", "AI Consultant"],
  },
  "AI Consultant": {
    icon: Compass,
    relatedTitles: ["AI Product Strategist", "System Architect", "Data Scientist"],
  },
  "GenAI Engineer": {
    icon: BrainCircuit,
    relatedTitles: ["System Architect", "Responsible AI Specialist", "AI Product Strategist"],
  },
  "Responsible AI Specialist": {
    icon: ShieldCheck,
    relatedTitles: ["GenAI Engineer", "Data Scientist"],
  },
  "AI Product Strategist": {
    icon: Target,
    relatedTitles: ["GenAI Engineer", "AI Consultant"],
  },
};

export function IdentitySection() {
  const orbitalItems = useMemo<OrbitalItem[]>(() => {
    const titleToId = new Map(
      person.identityCards.map((card, i) => [card.title, i + 1] as const),
    );
    return person.identityCards.map((card, i) => {
      const cfg = ROLE_CONFIG[card.title];
      return {
        id: i + 1,
        title: card.title,
        description: card.description,
        icon: cfg?.icon ?? BrainCircuit,
        relatedIds:
          cfg?.relatedTitles
            .map((t) => titleToId.get(t))
            .filter((v): v is number => typeof v === "number") ?? [],
      };
    });
  }, []);

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="mb-8">
          <ScrollReveal variant="fadeUp">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
              className="text-3xl md:text-4xl"
            >
              {HEADING}
            </h2>
          </ScrollReveal>
          <p
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
            className="mt-3 text-base md:text-lg max-w-2xl"
          >
            {SUBTEXT}
          </p>
        </div>

        <RadialOrbitalTimeline items={orbitalItems} />
      </div>
    </section>
  );
}
