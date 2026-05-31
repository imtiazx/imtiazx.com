"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import type { Opinion } from "@/lib/opinions";

export interface TweetStreamLoopProps {
  opinions: Opinion[];
  handle: string;
  displayName: string;
}

function avatarInitials(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  const compact = parts[0] ?? "";
  // For single-token names like "Web3Gen0", grab first letter + first digit
  // (or first two letters) so the chip always has a 2-glyph identity.
  const letter = compact[0]?.toUpperCase() ?? "";
  const second =
    compact.slice(1).match(/[0-9]/)?.[0] ??
    compact[1]?.toUpperCase() ??
    "";
  return (letter + second).slice(0, 2);
}

const CARD_GAP = 16;
const CYCLE_MS = 3600;
const RESUME_DELAY_MS = 3000;
const CARD_HEIGHT = 290;
const TRACK_BOTTOM = 24;
const SHELL_H_SIDEBYSIDE = 620;
const STACK_PIPE_TOP = 12;
const STACK_PIPE_HEIGHT = 260;
const STACK_GAP = 56;
const SHELL_H_STACKED =
  STACK_PIPE_TOP + STACK_PIPE_HEIGHT + STACK_GAP + CARD_HEIGHT + TRACK_BOTTOM;

// Pipeline visual reserves the left strip; remaining width feeds the card
// track. Below MIN_SIDEBYSIDE_W the pipeline rotates above the cards (stacked
// layout) so neither column crushes the other.
const MIN_SIDEBYSIDE_W = 880;

// Padding the inner pipeline container applies around its SVG. Both shapes
// must mirror what PipelineVisual renders, otherwise the bird's pixel
// position drifts away from the wires drawn on top of it.
const PIPE_PAD_SIDEBYSIDE = { top: 8, right: 4, bottom: 8, left: 16 };
const PIPE_PAD_STACKED = { top: 8, right: 24, bottom: 8, left: 24 };

interface TrackGeometry {
  visibleSlots: number;
  cardWidth: number;
  pipelineWidth: number;
  stacked: boolean;
  trackWidth: number;
  shellHeight: number;
  birdX: number;
  birdY: number;
  trackLeft: number;
  cardTop: number;
}

function computeGeometry(containerW: number): TrackGeometry {
  if (containerW < MIN_SIDEBYSIDE_W) {
    // Stacked: pipeline on top spans the full width, single card below.
    const cardWidth = Math.min(360, containerW - 48);
    const pad = PIPE_PAD_STACKED;
    const pipeInnerW = containerW - pad.left - pad.right;
    const pipeInnerH = STACK_PIPE_HEIGHT - pad.top - pad.bottom;
    const birdX = pad.left + (BIRD.x / PIPE_W) * pipeInnerW;
    const birdY = STACK_PIPE_TOP + pad.top + (BIRD.y / PIPE_H) * pipeInnerH;
    return {
      visibleSlots: 1,
      cardWidth,
      pipelineWidth: containerW,
      stacked: true,
      trackWidth: cardWidth,
      shellHeight: SHELL_H_STACKED,
      birdX,
      birdY,
      trackLeft: (containerW - cardWidth) / 2,
      cardTop: SHELL_H_STACKED - TRACK_BOTTOM - CARD_HEIGHT,
    };
  }
  // Side-by-side. Pipeline gets a generous fixed strip; cards take the rest.
  const pipelineWidth = Math.min(320, Math.max(240, containerW * 0.3));
  const trackAvail = containerW - pipelineWidth - 40; // 40 = right padding
  let visibleSlots = 3;
  let cardWidth = (trackAvail - (visibleSlots - 1) * CARD_GAP) / visibleSlots;
  if (cardWidth < 220) {
    visibleSlots = 2;
    cardWidth = (trackAvail - (visibleSlots - 1) * CARD_GAP) / visibleSlots;
  }
  if (cardWidth < 220) {
    visibleSlots = 1;
    cardWidth = Math.min(360, trackAvail);
  }
  cardWidth = Math.min(300, Math.max(220, cardWidth));
  const trackWidth = visibleSlots * cardWidth + (visibleSlots - 1) * CARD_GAP;
  const pad = PIPE_PAD_SIDEBYSIDE;
  const pipeInnerW = pipelineWidth - pad.left - pad.right;
  const pipeInnerH = SHELL_H_SIDEBYSIDE - pad.top - pad.bottom;
  return {
    visibleSlots,
    cardWidth,
    pipelineWidth,
    stacked: false,
    trackWidth,
    shellHeight: SHELL_H_SIDEBYSIDE,
    birdX: pad.left + (BIRD.x / PIPE_W) * pipeInnerW,
    birdY: pad.top + (BIRD.y / PIPE_H) * pipeInnerH,
    trackLeft: containerW - 24 - trackWidth,
    cardTop: SHELL_H_SIDEBYSIDE - TRACK_BOTTOM - CARD_HEIGHT,
  };
}

interface StreamCard {
  key: number;
  opinion: Opinion;
  slot: number;
}

const TWITTER_BIRD_PATH =
  "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z";

function TerminalGlyph({ size = 38 }: { size?: number }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} fill="none" aria-hidden>
      <polyline
        points="14,12 28,20 14,28"
        stroke="var(--color-brand)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="14"
        y1="34"
        x2="32"
        y2="34"
        stroke="var(--color-brand)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LaptopGlyph({ size = 42 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden>
      <rect
        x="9"
        y="11"
        width="30"
        height="20"
        rx="2"
        stroke="var(--color-brand)"
        strokeWidth="2"
      />
      <rect
        x="13"
        y="15"
        width="22"
        height="12"
        rx="1"
        stroke="var(--color-brand)"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1="5"
        y1="35"
        x2="43"
        y2="35"
        stroke="var(--color-brand)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="38"
        x2="28"
        y2="38"
        stroke="var(--color-brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

function BirdGlyph({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d={TWITTER_BIRD_PATH} fill="var(--color-brand)" />
    </svg>
  );
}

function formatRelative(publishedAt: string): string {
  const then = new Date(publishedAt).getTime();
  if (Number.isNaN(then)) return "now";
  const diffMs = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < day) return "today";
  const days = Math.floor(diffMs / day);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(days / 365);
  return `${years}y`;
}

/**
 * The "What I Think" loop. A terminal -> laptop -> bird pipeline on the left
 * pushes new tweet cards into a horizontal track on the right; on each tick the
 * existing cards slide right by one slot and the rightmost slides off-stage.
 * Hovering any card pauses the loop and glows the card; the loop resumes 3s
 * after the cursor leaves.
 */
export default function TweetStreamLoop({
  opinions,
  handle,
  displayName,
}: TweetStreamLoopProps) {
  const prefersReducedMotion = useReducedMotion();
  const initials = useMemo(() => avatarInitials(displayName), [displayName]);

  // headIdx is the index of the *next* opinion to push in. We always render
  // VISIBLE_SLOTS + 1 cards: one inbound slot (-1), three on-stage (0..2), and
  // one outbound slot (3) that animates off. Cards carry a monotonically rising
  // `key` so React keeps animation identity across cycles even when the same
  // opinion repeats.
  const [headIdx, setHeadIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  // Measured container width; null until the first resize callback fires so
  // we can render a safe SSR fallback instead of guessing the breakpoint.
  const [containerW, setContainerW] = useState<number | null>(null);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const update = () => setContainerW(el.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geometry = useMemo<TrackGeometry>(
    () => computeGeometry(containerW ?? 1100),
    [containerW],
  );

  // Live `paused` ref so the interval callback never reads a stale value when
  // hover toggles between ticks.
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setHeadIdx((h) => (h + 1) % Math.max(opinions.length, 1));
      setTick((t) => t + 1);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [opinions.length, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const handleCardEnter = () => {
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    setPaused(true);
  };

  const handleCardLeave = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      setPaused(false);
      resumeTimer.current = null;
    }, RESUME_DELAY_MS);
  };

  // Build the rendered card list: slot -1 is the inbound card emerging from
  // the bird, slot VISIBLE_SLOTS is the outbound card sliding off-stage.
  const cards: StreamCard[] = useMemo(() => {
    if (opinions.length === 0) return [];
    const list: StreamCard[] = [];
    const { visibleSlots } = geometry;
    for (let slot = -1; slot <= visibleSlots; slot++) {
      const opinionIdx =
        ((headIdx - slot - 1) % opinions.length + opinions.length) %
        opinions.length;
      list.push({
        key: tick * 100 + (slot + 1),
        opinion: opinions[opinionIdx],
        slot,
      });
    }
    return list;
  }, [headIdx, tick, opinions, geometry]);

  // Reduced-motion: static 3-up grid, no pipeline animation.
  if (prefersReducedMotion) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {opinions.slice(0, 3).map((o) => (
          <TweetCard
            key={o.id}
            opinion={o}
            handle={handle}
            displayName={displayName}
            initials={initials}
            glowing={false}
            onEnter={() => {}}
            onLeave={() => {}}
          />
        ))}
      </div>
    );
  }

  const {
    visibleSlots,
    cardWidth,
    pipelineWidth,
    stacked,
    shellHeight,
    birdX,
    birdY,
    trackLeft,
    cardTop,
  } = geometry;

  // Use actual measured width once available so the bird-wire SVG matches
  // the rendered DOM exactly; fall back to the synthetic 1100 we use for the
  // first render so SSR doesn't paint at zero width.
  const shellWidth = containerW ?? 1100;

  return (
    <div
      ref={shellRef}
      className="tsl-shell relative w-full"
      style={{
        height: shellHeight,
        // Clip outbound/inbound cards (which sit just past the slot range) so
        // they never poke into the document layout, while leaving no visible
        // border or surface for the section itself.
        overflow: "hidden",
      }}
    >
      <PipelineVisual stacked={stacked} pipelineWidth={pipelineWidth} />

      {/* Bird-to-card wires drawn in shell pixel coords so the wire endpoints
          line up with the actual card slots regardless of breakpoint. */}
      <BirdWires
        shellWidth={shellWidth}
        shellHeight={shellHeight}
        birdX={birdX}
        birdY={birdY}
        cardTop={cardTop}
        trackLeft={trackLeft}
        cardWidth={cardWidth}
        visibleSlots={visibleSlots}
      />

      {/* Card track: bottom-anchored so the bird-to-card wires have visible
          breathing room above the cards. Cards translate horizontally between
          slot positions on each tick. */}
      <div
        className="tsl-track absolute"
        style={{
          left: trackLeft,
          top: cardTop,
          width: geometry.trackWidth,
          height: CARD_HEIGHT,
        }}
      >
        {cards.map(({ key, opinion, slot }) => {
          const x = slot * (cardWidth + CARD_GAP);
          const onStage = slot >= 0 && slot < visibleSlots;
          const opacity = onStage ? 1 : 0;
          return (
            <div
              key={key}
              className="absolute top-0"
              style={{
                width: cardWidth,
                height: CARD_HEIGHT,
                transform: `translateX(${x}px)`,
                opacity,
                transition: prefersReducedMotion
                  ? "none"
                  : "transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease",
                pointerEvents: onStage ? "auto" : "none",
              }}
            >
              <TweetCard
                opinion={opinion}
                handle={handle}
                displayName={displayName}
                initials={initials}
                glowing={paused}
                onEnter={handleCardEnter}
                onLeave={handleCardLeave}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// All pipeline coordinates live in this one viewBox so the SVG wires and the
// absolutely-positioned icon nodes share a single source of truth. We force
// the SVG to stretch to the container with preserveAspectRatio="none" and use
// percentage offsets for the icons; both then deform together if the box is
// resized, keeping wires landing exactly on icon edges at every breakpoint.
const PIPE_W = 320;
const PIPE_H = 480;
const ICON_BOX = 60;
const ICON_BOX_SMALL = 44;

// Icon centers in viewBox coords. TERMINAL.y is tuned so the terminal's bottom
// edge in side-by-side mode lands on the same baseline as the tweet cards'
// bottom edge (cardTop + CARD_HEIGHT). The maths:
//   cardBottom = SHELL_H_SIDEBYSIDE - TRACK_BOTTOM
//   terminalBottom = pad.top + (TERMINAL.y / PIPE_H) * (SHELL_H - 16) + ICON_BOX/2
// Solving cardBottom == terminalBottom at SHELL_H=620 gives TERMINAL.y ≈ 443.
// LAPTOP sits at the geometric midpoint of TERMINAL and BIRD on both axes so
// the three-stop pipeline reads as a balanced staircase.
const TERMINAL = { x: 72, y: 443 };
const BIRD = { x: 230, y: 96 };
const LAPTOP = {
  x: (TERMINAL.x + BIRD.x) / 2,
  y: (TERMINAL.y + BIRD.y) / 2,
};

// Wire endpoints sit on the icon edges (not inside them) so the dashed traces
// terminate visibly at each component pad.
const TERM_TOP = { x: TERMINAL.x, y: TERMINAL.y - ICON_BOX / 2 };
const LAPTOP_BL = { x: LAPTOP.x - 22, y: LAPTOP.y + ICON_BOX / 2 };
const LAPTOP_TR = { x: LAPTOP.x + 22, y: LAPTOP.y - ICON_BOX / 2 };
const BIRD_BL = { x: BIRD.x - 14, y: BIRD.y + ICON_BOX_SMALL / 2 };

// Manhattan PCB traces with a midpoint stub so each leg leaves its component
// perpendicular to the edge.
const WIRE_A_MID_Y = LAPTOP_BL.y + 30;
const WIRE_B_MID_Y = BIRD_BL.y + 30;
const WIRE_A = `M ${TERM_TOP.x} ${TERM_TOP.y} L ${TERM_TOP.x} ${WIRE_A_MID_Y} L ${LAPTOP_BL.x} ${WIRE_A_MID_Y} L ${LAPTOP_BL.x} ${LAPTOP_BL.y}`;
const WIRE_B = `M ${LAPTOP_TR.x} ${LAPTOP_TR.y} L ${LAPTOP_TR.x} ${WIRE_B_MID_Y} L ${BIRD_BL.x} ${WIRE_B_MID_Y} L ${BIRD_BL.x} ${BIRD_BL.y}`;

function PipelineVisual({
  stacked = false,
  pipelineWidth,
}: {
  stacked?: boolean;
  pipelineWidth: number;
}) {
  const padding = stacked
    ? `${PIPE_PAD_STACKED.top}px ${PIPE_PAD_STACKED.right}px ${PIPE_PAD_STACKED.bottom}px ${PIPE_PAD_STACKED.left}px`
    : `${PIPE_PAD_SIDEBYSIDE.top}px ${PIPE_PAD_SIDEBYSIDE.right}px ${PIPE_PAD_SIDEBYSIDE.bottom}px ${PIPE_PAD_SIDEBYSIDE.left}px`;
  return (
    <div
      aria-hidden
      className="absolute"
      style={
        stacked
          ? {
              // Stacked: pipeline rides across the top so the data flow reads
              // top-down into the single-card stage below.
              left: 0,
              right: 0,
              top: STACK_PIPE_TOP,
              height: STACK_PIPE_HEIGHT,
              pointerEvents: "none",
            }
          : {
              left: 0,
              top: 0,
              height: SHELL_H_SIDEBYSIDE,
              width: pipelineWidth,
              pointerEvents: "none",
            }
      }
    >
      <div className="relative w-full h-full" style={{ padding }}>
        <svg
          viewBox={`0 0 ${PIPE_W} ${PIPE_H}`}
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          style={{ overflow: "visible", display: "block" }}
        >
          {/* Decorative via dots scattered behind for PCB texture */}
          {[
            [40, 60],
            [110, 70],
            [200, 50],
            [280, 130],
            [40, 200],
            [280, 280],
            [50, 320],
            [200, 420],
            [120, 440],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.6}
              fill="color-mix(in srgb, var(--color-brand) 22%, transparent)"
            />
          ))}

          <path
            d={WIRE_A}
            fill="none"
            stroke="color-mix(in srgb, var(--color-brand) 38%, transparent)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={WIRE_B}
            fill="none"
            stroke="color-mix(in srgb, var(--color-brand) 38%, transparent)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Pin pads on each wire endpoint */}
          {[TERM_TOP, LAPTOP_BL, LAPTOP_TR, BIRD_BL].map((p, i) => (
            <circle
              key={`pad-${i}`}
              cx={p.x}
              cy={p.y}
              r={2.6}
              fill="color-mix(in srgb, var(--color-brand) 70%, transparent)"
            />
          ))}

          {/* Animated data dots on each wire. Staggered begin times make the
              eye read one continuous packet flowing terminal -> laptop -> bird.
              Durations match BirdWires + the node-pulse cycle so the whole
              section reads at one calm rhythm. */}
          <circle
            r={3.8}
            fill="var(--color-brand)"
            style={{
              filter:
                "drop-shadow(0 0 5px color-mix(in srgb, var(--color-brand) 85%, transparent))",
            }}
          >
            <animateMotion dur="5s" repeatCount="indefinite" path={WIRE_A} />
          </circle>
          <circle
            r={3.8}
            fill="var(--color-brand)"
            style={{
              filter:
                "drop-shadow(0 0 5px color-mix(in srgb, var(--color-brand) 85%, transparent))",
            }}
          >
            <animateMotion
              dur="5s"
              begin="2.5s"
              repeatCount="indefinite"
              path={WIRE_B}
            />
          </circle>
        </svg>

        {/* Icon nodes overlaid on the stretched SVG. They use percentages of
            the same container so they track the wires across resizes. */}
        <PipelineNode
          centerX={TERMINAL.x}
          centerY={TERMINAL.y}
          size={ICON_BOX}
          pulseDelay="0s"
        >
          <TerminalGlyph />
        </PipelineNode>
        <PipelineNode
          centerX={LAPTOP.x}
          centerY={LAPTOP.y}
          size={ICON_BOX}
          pulseDelay="1.67s"
        >
          <LaptopGlyph />
        </PipelineNode>
        <PipelineNode
          centerX={BIRD.x}
          centerY={BIRD.y}
          size={ICON_BOX_SMALL}
          pulseDelay="3.33s"
        >
          <BirdGlyph />
        </PipelineNode>
      </div>
    </div>
  );
}

function PipelineNode({
  centerX,
  centerY,
  size,
  pulseDelay,
  children,
}: {
  centerX: number;
  centerY: number;
  size: number;
  pulseDelay: string;
  children: React.ReactNode;
}) {
  const leftPct = (centerX / PIPE_W) * 100;
  const topPct = (centerY / PIPE_H) * 100;
  return (
    <div
      className="tsl-node"
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        // Circular to match the orbital-node language used elsewhere on the
        // homepage (e.g. RadialOrbitalTimeline / IdentitySection's center seal).
        borderRadius: "9999px",
        backgroundColor: "var(--color-surface)",
        border:
          "1.5px solid color-mix(in srgb, var(--color-brand) 45%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          "0 4px 16px color-mix(in srgb, var(--color-brand) 14%, transparent)",
        animation: `tslNodePulse 5s ease-in-out ${pulseDelay} infinite`,
      }}
    >
      {children}
      <style jsx>{`
        @keyframes tslNodePulse {
          0%,
          100% {
            box-shadow: 0 4px 16px
              color-mix(in srgb, var(--color-brand) 14%, transparent);
            border-color: color-mix(in srgb, var(--color-brand) 45%, transparent);
          }
          18%,
          32% {
            box-shadow: 0 0 24px 5px
              color-mix(in srgb, var(--color-brand) 50%, transparent);
            border-color: var(--color-brand);
          }
        }
      `}</style>
    </div>
  );
}

interface TweetCardProps {
  opinion: Opinion;
  handle: string;
  displayName: string;
  initials: string;
  glowing: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

function TweetCard({
  opinion,
  handle,
  displayName,
  initials,
  glowing,
  onEnter,
  onLeave,
}: TweetCardProps) {
  const [hovered, setHovered] = useState(false);
  const hasUrl = opinion.url !== "#";
  const isHighlighted = hovered;
  const relative = formatRelative(opinion.publishedAt);

  return (
    <article
      onMouseEnter={() => {
        setHovered(true);
        onEnter();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onLeave();
      }}
      style={{
        width: "100%",
        // Fill the wrapper slot so card-bottom = cardTop + CARD_HEIGHT exactly.
        // Without this the article only stretches to its content (clamped by
        // min-height), leaving a ~10px gap below the visible card that
        // breaks the terminal-bottom / card-bottom baseline alignment.
        height: "100%",
        minHeight: 280,
        backgroundColor: "var(--color-surface)",
        borderRadius: 14,
        border: `1px solid ${
          isHighlighted
            ? "var(--color-brand)"
            : "color-mix(in srgb, var(--color-brand) 20%, var(--color-border))"
        }`,
        boxShadow: isHighlighted
          ? "0 0 0 1px color-mix(in srgb, var(--color-brand) 35%, transparent), 0 12px 40px color-mix(in srgb, var(--color-brand) 22%, transparent)"
          : "0 6px 20px rgba(0, 0, 0, 0.06)",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: hasUrl ? "pointer" : "default",
        transition: "border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease",
        transform: isHighlighted ? "translateY(-2px)" : "translateY(0)",
        position: "relative",
      }}
      onClick={() => {
        if (!hasUrl) return;
        window.open(opinion.url, "_blank", "noopener,noreferrer");
      }}
    >
      {/* Header row: avatar photo + name + handle + relative time */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/tweet_profile.jpg"
          alt={`${displayName} (${initials})`}
          width={34}
          height={34}
          style={{
            width: 34,
            height: 34,
            borderRadius: "9999px",
            border:
              "1px solid color-mix(in srgb, var(--color-brand) 45%, transparent)",
            flexShrink: 0,
            objectFit: "cover",
            display: "block",
          }}
        />
        <div className="flex flex-col leading-tight min-w-0">
          <span
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-primary)",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {displayName}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              fontSize: 11,
            }}
          >
            @{handle} &middot; {relative}
          </span>
        </div>
        <div className="ml-auto">
          <BirdGlyph size={16} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 flex-1">
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-primary)",
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1.35,
            margin: 0,
          }}
          className="line-clamp-3"
        >
          {opinion.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-secondary)",
            fontSize: 12.5,
            lineHeight: 1.5,
            margin: 0,
          }}
          className="line-clamp-3"
        >
          {opinion.oneliner}
        </p>
      </div>

      {/* Footer row: tweet-style metrics + platform chip. The numbers are
          deterministic stand-ins derived from the opinion id so they don't
          shift on re-render; the bottom row is decorative, not interactive. */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div
          className="flex items-center gap-3"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
          }}
        >
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={12} />
            {syntheticMetric(opinion.id, 3, 47)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Repeat2 size={12} />
            {syntheticMetric(opinion.id, 7, 142)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={12} />
            {syntheticMetric(opinion.id, 11, 980)}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            borderColor: "color-mix(in srgb, var(--color-brand) 40%, transparent)",
            color: "var(--color-brand)",
            fontSize: 9,
            padding: "2px 6px",
          }}
          className="border rounded uppercase tracking-wider"
        >
          {opinion.platform}
        </span>
      </div>

      {/* Decorative inset glow when card is the active (paused) hover target. */}
      {glowing && hovered && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 14,
            pointerEvents: "none",
            boxShadow:
              "inset 0 0 28px color-mix(in srgb, var(--color-brand) 14%, transparent)",
          }}
        />
      )}
    </article>
  );
}

interface BirdWiresProps {
  shellWidth: number;
  shellHeight: number;
  birdX: number;
  birdY: number;
  cardTop: number;
  trackLeft: number;
  cardWidth: number;
  visibleSlots: number;
}

const BIRD_TO_CARD_DUR = 4.5;
const BIRD_TO_CARD_STAGGER = 1.5;
const BIRD_EDGE_OFFSET = ICON_BOX_SMALL / 2; // half-width of the bird icon
// Trunk ends exactly at the last tap — no dangling stub.
const TRUNK_OVERSHOOT = 0;

/**
 * SVG overlay that drives the bird-to-card connector as a single trunk with
 * vertical drops at each card slot, plus a brand-orange data packet that
 * travels bird -> trunk -> drop for every card. Splitting the visible wire
 * into one trunk + N tap-offs (rather than N independent fan-out wires) keeps
 * the area between bird and cards readable as a small bus instead of a tangle.
 *
 * Each dot has its own full path (bird -> tap_i -> card_i) so the dot
 * naturally slows along the longer trunk leg before dropping. Begin times
 * stagger across the cycle so a packet is always in flight on the bus.
 */
function BirdWires({
  shellWidth,
  shellHeight,
  birdX,
  birdY,
  cardTop,
  trackLeft,
  cardWidth,
  visibleSlots,
}: BirdWiresProps) {
  const { trunkPath, drops, dotPaths } = useMemo(() => {
    const trunkStartX = birdX + BIRD_EDGE_OFFSET;
    const tapXs: number[] = [];
    for (let i = 0; i < visibleSlots; i++) {
      tapXs.push(trackLeft + i * (cardWidth + CARD_GAP) + cardWidth / 2);
    }
    const trunkEndX = (tapXs[tapXs.length - 1] ?? trunkStartX) + TRUNK_OVERSHOOT;
    const trunkPath = `M ${trunkStartX.toFixed(2)} ${birdY.toFixed(2)} L ${trunkEndX.toFixed(2)} ${birdY.toFixed(2)}`;
    const drops = tapXs.map((tx) => ({
      tapX: tx,
      path: `M ${tx.toFixed(2)} ${birdY.toFixed(2)} L ${tx.toFixed(2)} ${cardTop.toFixed(2)}`,
    }));
    // Each card's dot follows the full route from bird to that card via the
    // shared trunk; dots for farther cards traverse more of the trunk before
    // dropping, so the bus reads as one continuous flow with branches.
    const dotPaths = tapXs.map(
      (tx) =>
        `M ${birdX.toFixed(2)} ${birdY.toFixed(2)} L ${tx.toFixed(2)} ${birdY.toFixed(2)} L ${tx.toFixed(2)} ${cardTop.toFixed(2)}`,
    );
    return { trunkPath, drops, dotPaths };
  }, [birdX, birdY, cardTop, trackLeft, cardWidth, visibleSlots]);

  return (
    <svg
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      width={shellWidth}
      height={shellHeight}
      viewBox={`0 0 ${shellWidth} ${shellHeight}`}
      preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      {/* Shared bird-end pad (every wire originates here). */}
      <circle
        cx={birdX}
        cy={birdY}
        r={2.6}
        fill="color-mix(in srgb, var(--color-brand) 75%, transparent)"
      />

      {/* Single horizontal trunk leaving the bird's right side */}
      <path
        d={trunkPath}
        fill="none"
        stroke="color-mix(in srgb, var(--color-brand) 36%, transparent)"
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray="3 5"
        vectorEffect="non-scaling-stroke"
      />

      {/* Vertical drops + junction tee dots + card-end pads */}
      {drops.map(({ tapX, path }, i) => (
        <g key={`drop-${i}`}>
          <path
            d={path}
            fill="none"
            stroke="color-mix(in srgb, var(--color-brand) 36%, transparent)"
            strokeWidth={1.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Tee dot at the trunk-drop junction. */}
          <circle
            cx={tapX}
            cy={birdY}
            r={2.4}
            fill="color-mix(in srgb, var(--color-brand) 70%, transparent)"
          />
          {/* Card-end pad — sits just above the card's top edge. */}
          <circle
            cx={tapX}
            cy={cardTop}
            r={2.4}
            fill="color-mix(in srgb, var(--color-brand) 70%, transparent)"
          />
        </g>
      ))}

      {/* Animated brand-orange data packets, one per destination card */}
      {dotPaths.map((path, i) => (
        <circle
          key={`dot-${i}`}
          r={3.6}
          fill="var(--color-brand)"
          style={{
            filter:
              "drop-shadow(0 0 5px color-mix(in srgb, var(--color-brand) 85%, transparent))",
          }}
        >
          <animateMotion
            dur={`${BIRD_TO_CARD_DUR}s`}
            begin={`${(i * BIRD_TO_CARD_STAGGER).toFixed(2)}s`}
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      ))}
    </svg>
  );
}

// Deterministic metric counts so repeated renders of the same opinion don't
// flicker. Spreads results across [floor, floor + range) using a tiny FNV-style
// hash of the opinion id.
function syntheticMetric(seed: string, floor: number, range: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const v = Math.abs(h) % range;
  return floor + v;
}
