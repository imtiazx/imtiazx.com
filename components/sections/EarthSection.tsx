"use client";

import { Suspense, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SplineEarth } from "@/components/ui/SplineEarth";

const actions = [
  "offset your cloud compute emissions.",
  "switch your team to a green hosting provider.",
  "plant one tree this month. just one.",
  "compost your food waste. it cuts methane at the source.",
  "audit your ML pipeline's carbon footprint.",
  "repair before you replace. e-waste is the fastest growing waste stream on earth.",
  "support open energy data initiatives.",
  "walk or cycle for short distances. your body and the grid both win.",
  "talk about this. loudly. at work.",
  "vote for people who take this seriously.",
];

// ----------------------------------------------------------------------------
// Typewriter
// ----------------------------------------------------------------------------
type TypewriterMode = "typing" | "pauseFull" | "deleting" | "pauseEmpty";

function Typewriter({ reduced }: { reduced: boolean }) {
  const [actionIdx, setActionIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [mode, setMode] = useState<TypewriterMode>("typing");

  useEffect(() => {
    if (reduced) return;
    const action = actions[actionIdx];
    let timeoutId: ReturnType<typeof setTimeout>;

    if (mode === "typing") {
      if (displayed.length < action.length) {
        timeoutId = setTimeout(
          () => setDisplayed(action.slice(0, displayed.length + 1)),
          45,
        );
      } else {
        timeoutId = setTimeout(() => setMode("pauseFull"), 0);
      }
    } else if (mode === "pauseFull") {
      timeoutId = setTimeout(() => setMode("deleting"), 2000);
    } else if (mode === "deleting") {
      if (displayed.length > 0) {
        timeoutId = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 25);
      } else {
        timeoutId = setTimeout(() => setMode("pauseEmpty"), 0);
      }
    } else {
      timeoutId = setTimeout(() => {
        setActionIdx((i) => (i + 1) % actions.length);
        setMode("typing");
      }, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [displayed, mode, actionIdx, reduced]);

  const shown = reduced ? actions[0] : displayed;

  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 15,
        color: "#F5F0EB",
        lineHeight: 1.7,
        letterSpacing: "0.01em",
      }}
    >
      <span style={{ color: "#4ADE80", marginRight: 8 }}>{">"}</span>
      <span style={{ color: "#A8A29E" }}>you can </span>
      <span style={{ fontWeight: 500 }}>{shown}</span>
      <span aria-hidden className="cursor-blink" style={{ marginLeft: 1 }}>
        |
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Section
// ----------------------------------------------------------------------------
export function EarthSection() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      id="earth"
      className="relative overflow-hidden"
    >
      {/* Full-bleed Earth stage. The "We build intelligent systems..." headline
          lives inside the Spline scene itself. The section has no top/bottom
          padding so the canvas touches the neighbouring sections directly. */}
      <div
        className="relative w-full"
        style={{ height: "clamp(620px, 92vh, 960px)" }}
      >
        <Suspense fallback={null}>
          <SplineEarth className="absolute inset-0 w-full h-full" />
        </Suspense>

        {/* Bottom-centered overlay — lands on the dark lower hemisphere of
            the planet / dark space beneath it */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none flex justify-center px-6 pb-14 md:pb-20">
          <div className="text-center">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                color: "#4ADE80",
                fontSize: 16,
                letterSpacing: "0.28em",
                fontWeight: 700,
              }}
              className="uppercase"
            >
              For the next generation.
            </div>

            <div className="mt-6 inline-block text-left">
              <Typewriter reduced={prefersReducedMotion} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
