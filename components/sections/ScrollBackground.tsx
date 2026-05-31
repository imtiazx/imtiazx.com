"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Observer config ────────────────────────────────────────────────────── */
// -1 means "no background layer for this section" — hero is owned by the
// Spline brain, earth by the Spline earth; the floating math symbols, neural
// net, and horizontal sine waves were all removed (felt busy on top of the
// content).
const ZONE_NONE = -1;
const ZONE_DOTS = 0;
const ZONE_GLOW = 1;

const ZONE_MAP: Record<string, number> = {
  hero:         ZONE_NONE,
  projects:     ZONE_DOTS,
  hackathons:   ZONE_DOTS,
  identity:     ZONE_DOTS,
  writing:      ZONE_DOTS,
  perspectives: ZONE_DOTS,
  crypto:       ZONE_DOTS,
  earth:        ZONE_NONE,
  footer:       ZONE_GLOW,
};
const SECTION_IDS = Object.keys(ZONE_MAP);
const FADE_MS = 800;

/* ─── Zone components ────────────────────────────────────────────────────── */
// Each zone is its own component so React mounts/unmounts the heavy DOM tree
// when we cross-fade between zones, instead of keeping every tree alive at
// opacity 0. Strokes/fills reference --color-brand directly so the background
// tracks the active theme.
//
// Cross-fade is driven by `state="in" | "out"` and a CSS keyframe (defined in
// globals.css as `zoneFadeIn` / `zoneFadeOut`). A plain opacity-transition
// wouldn't fire on freshly mounted children because the starting value
// already matches the target.

interface ZoneProps { state: "in" | "out" }

const layerBase: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: -1,
  overflow: "hidden",
};

const stateStyle = (state: "in" | "out"): React.CSSProperties => ({
  animationName: state === "in" ? "zoneFadeIn" : "zoneFadeOut",
  animationDuration: `${FADE_MS}ms`,
  animationTimingFunction: "ease-in-out",
  animationFillMode: "forwards",
});

function DotsZone({ state, isDark }: ZoneProps & { isDark: boolean }) {
  return (
    <div style={{ ...layerBase, ...stateStyle(state) }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <defs>
          {/* Light mode: ~40% denser grid (tile 30 vs 36 -> 1.44x the dots)
              in brand orange at 0.35 so the dots actually read on the warm
              background. Dark mode keeps its original tile and faint fills. */}
          <pattern
            id="sb-small-dots"
            x="0" y="0"
            width={isDark ? 36 : 30} height={isDark ? 36 : 30}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={isDark ? 18 : 15} cy={isDark ? 18 : 15} r="0.75"
              style={
                isDark
                  ? { fill: "var(--color-brand)", fillOpacity: 0.10 }
                  : { fill: "var(--color-brand)", fillOpacity: 0.35 }
              }
            />
          </pattern>
          <pattern
            id="sb-large-dots"
            x="0" y="0"
            width={isDark ? 216 : 180} height={isDark ? 216 : 180}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={isDark ? 18 : 15} cy={isDark ? 18 : 15} r="1.25"
              style={
                isDark
                  ? { fill: "var(--color-brand)", fillOpacity: 0.18 }
                  : { fill: "var(--color-brand)", fillOpacity: 0.35 }
              }
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sb-small-dots)" />
        <rect width="100%" height="100%" fill="url(#sb-large-dots)" />
      </svg>
    </div>
  );
}

function GlowZone({ state }: ZoneProps) {
  return (
    <div
      style={{
        ...layerBase,
        ...stateStyle(state),
        background:
          "radial-gradient(ellipse at center, color-mix(in srgb, var(--color-brand) 8%, transparent) 0%, transparent 70%)",
      }}
    />
  );
}

function renderZone(
  zone: number,
  state: "in" | "out",
  isDark: boolean,
) {
  switch (zone) {
    case ZONE_DOTS:
      return <DotsZone state={state} isDark={isDark} />;
    case ZONE_GLOW:
      return <GlowZone state={state} />;
    default:
      return null;
  }
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function ScrollBackground() {
  // Start with no background until an IntersectionObserver entry tells us
  // which zone the user is in. Avoids painting the dots over the hero before
  // the observer has fired.
  const [zone,          setZone]          = useState(ZONE_NONE);
  // The zone we're fading *out* during a transition. null when no transition
  // is in flight. We mount both `zone` and `fadingOut` for FADE_MS, then
  // unmount the outgoing one so we never keep more than two zone subtrees
  // alive at a time.
  const [fadingOut,     setFadingOut]     = useState<number | null>(null);
  const [active,        setActive]        = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDark,        setIsDark]        = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const compute = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    compute();
    const obs = new MutationObserver(compute);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(rm);
    setActive(true);

    if (rm) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const z = ZONE_MAP[entry.target.id];
            if (z !== undefined) {
              setZone((prev) => {
                if (z === prev) return prev;
                // Start a cross-fade: keep the old zone mounted for FADE_MS,
                // then unmount it. clearing any in-flight unmount timer first
                // so back-to-back scroll jumps don't strand an outgoing zone.
                if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
                setFadingOut(prev);
                fadeTimerRef.current = setTimeout(() => {
                  setFadingOut(null);
                  fadeTimerRef.current = null;
                }, FADE_MS);
                return z;
              });
            }
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  if (!active) return null;

  // Reduced motion: render exactly the active zone with no fade, no second
  // tree, no transitions. The global `prefers-reduced-motion` rule in
  // globals.css collapses the keyframe duration so the zone snaps in.
  if (reducedMotion) {
    return renderZone(zone, "in", isDark);
  }

  return (
    <>
      {renderZone(zone, "in", isDark)}
      {fadingOut !== null && fadingOut !== zone &&
        renderZone(fadingOut, "out", isDark)}
    </>
  );
}
