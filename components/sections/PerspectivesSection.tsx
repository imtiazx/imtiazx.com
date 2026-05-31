"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { opinions } from "@/lib/opinions";
import { person } from "@/lib/person";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import TweetStreamLoop from "@/components/ui/TweetStreamLoop";

const HEADING = "What I Think";
const SUBTEXT =
  "Live takes from the timeline. Twitter-first thinking on AI infra, energy, open source, and the discipline of shipping.";

// The Twitter identity is intentionally distinct from person.handle (which is
// the cross-site identity). Keeping it inline here avoids polluting person.ts
// with section-specific display strings.
const TWITTER_NAME = "Web3Gen0";
const TWITTER_HANDLE = "web3gen0";

export function PerspectivesSection() {
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
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-muted)",
            }}
            className="mt-3 text-base md:text-lg max-w-2xl"
          >
            {SUBTEXT}
          </p>
        </div>

        <TweetStreamLoop
          opinions={opinions}
          handle={TWITTER_HANDLE}
          displayName={TWITTER_NAME}
        />

        <div className="mt-8 flex justify-end">
          <Link
            href={person.social.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-brand)", fontFamily: "var(--font-sans)" }}
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all duration-150"
          >
            Live Feed
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
