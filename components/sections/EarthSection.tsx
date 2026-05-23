"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

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

type Phase = 1 | 2 | 3 | 4;

// ----------------------------------------------------------------------------
// Penguin body, drawn centered at (0, 0). Wrap with transform for placement.
// ----------------------------------------------------------------------------
function PenguinBody({ headClass = "" }: { headClass?: string }) {
  return (
    <>
      {/* Wings (drawn first so body covers their roots) */}
      <ellipse cx="-38" cy="0" rx="9" ry="24" fill="#0A0A0A" transform="rotate(-12 -38 0)" />
      <ellipse cx="38"  cy="0" rx="9" ry="24" fill="#0A0A0A" transform="rotate(12 38 0)" />

      {/* Body */}
      <ellipse cx="0" cy="0" rx="38" ry="52" fill="#0A0A0A" />
      {/* Belly */}
      <ellipse cx="0" cy="6" rx="22" ry="36" fill="#FFFFFF" />

      {/* Feet */}
      <rect x="-14" y="48" width="10" height="7" rx="2" fill="var(--color-brand)" />
      <rect x="4"   y="48" width="10" height="7" rx="2" fill="var(--color-brand)" />

      {/* Head group (rotates once in phase 2 when headClass is applied) */}
      <g className={headClass}>
        <circle cx="0"   cy="-58" r="30" fill="#0A0A0A" />
        {/* Eyes */}
        <circle cx="-11" cy="-62" r="5.5" fill="#FFFFFF" />
        <circle cx="11"  cy="-62" r="5.5" fill="#FFFFFF" />
        {/* Pupils */}
        <circle cx="-9"  cy="-61" r="2.6" fill="#0A0A0A" />
        <circle cx="13"  cy="-61" r="2.6" fill="#0A0A0A" />
        {/* Beak */}
        <polygon points="18,-58 33,-54 18,-50" fill="var(--color-brand)" />
      </g>
    </>
  );
}

// ----------------------------------------------------------------------------
// Penguin scene
// ----------------------------------------------------------------------------
function PenguinScene({ phase, reduced }: { phase: Phase; reduced: boolean }) {
  // Active CSS class for continuous animations only in calm phase 1
  const calm = phase === 1 && !reduced;

  // Phase-driven offsets (CSS transition handles smoothness)
  // Baby1 to mom direction: mom at x=200, baby1 at x=140 — translate +x
  const baby1Shift =
    phase === 1 ? "translate(0px, 0px)"
    : phase === 2 ? "translate(20px, -3px)"
    : "translate(28px, -5px)";

  // Baby2 to mom direction: mom at x=200, baby2 at x=260 — translate -x
  const baby2Shift =
    phase === 1 ? "translate(0px, 0px)"
    : phase === 2 ? "translate(-20px, -3px)"
    : "translate(-28px, -5px)";

  // Baby3 drifts further away from group in panic phase
  const baby3Shift =
    phase === 1 ? "translate(0px, 0px)"
    : phase === 2 ? "translate(-4px, 0px)"
    : "translate(-10px, 0px)";

  // Mom leans forward in panic phase
  const momLean = phase === 3 ? "rotate(-5deg)" : "rotate(0deg)";

  // Ice splits horizontally during panic
  const iceLeftShift  = phase === 3 ? "translate(-8px, 0px)" : "translate(0px, 0px)";
  const iceRightShift = phase === 3 ? "translate(8px, 0px)"  : "translate(0px, 0px)";

  // Head look animation runs in phase 2 only (key forces remount → restart)
  const momHeadClass = phase === 2 && !reduced ? "mom-head-look" : "";

  // Crack states
  const crack12Visible = phase >= 2;
  const crack3Visible  = phase >= 3;
  const cracksThick    = phase >= 3;

  // Outer scene fades during reset phase 4
  const sceneClass = `earth-scene${phase === 4 ? " earth-fade" : ""}`;

  const phaseTransition = "transform 1.2s ease-in-out";

  return (
    <svg
      viewBox="0 0 400 300"
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="A mother penguin sheltering three baby penguins on a cracking ice platform"
    >
      <g className={sceneClass}>
        {/* Ice platform — base ellipse */}
        <g style={{ transform: iceLeftShift, transition: phaseTransition }}>
          <ellipse cx="200" cy="260" rx="180" ry="40" fill="#C8E6F0" />
        </g>
        {/* Ice surface — lighter ellipse on top */}
        <g style={{ transform: iceRightShift, transition: phaseTransition }}>
          <ellipse cx="200" cy="255" rx="170" ry="30" fill="#E0F2F8" />
        </g>

        {/* Cracks */}
        <path
          d="M160,245 L130,270 M150,250 L150,275"
          stroke="#2A5A6A"
          fill="none"
          className={`ice-crack ${crack12Visible ? "crack-visible" : ""} ${cracksThick ? "crack-thick" : ""}`}
        />
        <path
          d="M240,250 L270,268 M250,255 L255,278"
          stroke="#2A5A6A"
          fill="none"
          className={`ice-crack ${crack12Visible ? "crack-visible" : ""} ${cracksThick ? "crack-thick" : ""}`}
        />
        <path
          d="M200,260 L200,280 M195,270 L185,278 M205,270 L215,278"
          stroke="#2A5A6A"
          fill="none"
          className={`ice-crack ${crack3Visible ? "crack-visible" : ""} ${cracksThick ? "crack-thick" : ""}`}
        />

        {/* Baby 3 — far left, tiny */}
        <g transform="translate(90 235)">
          <g transform="scale(0.45)">
            <g style={{ transform: baby3Shift, transition: phaseTransition }}>
              <g className={calm ? "penguin-baby3-calm" : ""}>
                <PenguinBody />
              </g>
            </g>
          </g>
        </g>

        {/* Baby 1 — left of mom */}
        <g transform="translate(140 210)">
          <g transform="rotate(-8) scale(0.6)">
            <g style={{ transform: baby1Shift, transition: phaseTransition }}>
              <g className={calm ? "penguin-baby1-calm" : ""}>
                <PenguinBody />
              </g>
            </g>
          </g>
        </g>

        {/* Baby 2 — right of mom */}
        <g transform="translate(260 215)">
          <g transform="rotate(8) scale(0.6)">
            <g style={{ transform: baby2Shift, transition: phaseTransition }}>
              <g className={calm ? "penguin-baby2-calm" : ""}>
                <PenguinBody />
              </g>
            </g>
          </g>
        </g>

        {/* Mom — center, largest */}
        <g transform="translate(200 170)">
          <g style={{ transform: momLean, transition: "transform 1s ease-in-out", transformOrigin: "0px 50px" }}>
            <g className={calm ? "penguin-mom-calm" : ""}>
              <PenguinBody key={`mom-${phase}`} headClass={momHeadClass} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

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
      className="mt-8"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 14,
        color: "#F5F0EB",
        lineHeight: 1.6,
      }}
    >
      <span style={{ color: "#A8A29E" }}>you can </span>
      <span>{shown}</span>
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
  const [phase, setPhase] = useState<Phase>(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Phase advancement loop with visibility pause/resume
  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase(1);
      return;
    }

    const durations: Record<Phase, number> = { 1: 8000, 2: 8000, 3: 8000, 4: 6000 };
    let current: Phase = 1;
    let phaseStart = Date.now();
    let remaining = durations[current];
    let paused = false;

    const tick = () => {
      current = (current === 4 ? 1 : ((current + 1) as Phase));
      setPhase(current);
      phaseStart = Date.now();
      remaining = durations[current];
      timeoutRef.current = setTimeout(tick, remaining);
    };

    setPhase(1);
    phaseStart = Date.now();
    remaining = durations[1];
    timeoutRef.current = setTimeout(tick, remaining);

    const handleVisibility = () => {
      if (document.hidden) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const elapsed = Date.now() - phaseStart;
        remaining = Math.max(0, remaining - elapsed);
        paused = true;
      } else if (paused) {
        phaseStart = Date.now();
        timeoutRef.current = setTimeout(tick, remaining);
        paused = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [prefersReducedMotion]);

  return (
    <section
      id="earth"
      className="py-20"
      style={{ backgroundColor: "#0C1A0E" }}
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-10 items-center">
          {/* Left — penguin scene */}
          <div className="order-1 lg:order-1">
            <PenguinScene phase={phase} reduced={prefersReducedMotion} />
          </div>

          {/* Right — text + typewriter */}
          <div className="order-2 lg:order-2">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "#16A34A",
                fontSize: 11,
              }}
              className="uppercase tracking-widest"
            >
              for the next generation
            </span>

            <h2
              style={{
                fontFamily: "var(--font-serif)",
                color: "#F5F0EB",
              }}
              className="text-3xl md:text-4xl lg:text-5xl mt-3 leading-tight"
            >
              The ice remembers.
            </h2>

            <p
              style={{
                fontFamily: "var(--font-sans)",
                color: "#A8A29E",
                fontSize: 15,
              }}
              className="mt-3 leading-relaxed max-w-prose"
            >
              We build intelligent systems. We should be intelligent about what powers them.
            </p>

            <Typewriter reduced={prefersReducedMotion} />

            <p
              style={{
                fontFamily: "var(--font-sans)",
                color: "#4A6741",
                fontSize: 12,
                fontStyle: "italic",
              }}
              className="mt-12"
            >
              Tux is not just Linux&apos;s mascot.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
