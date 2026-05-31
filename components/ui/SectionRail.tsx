"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Home,
  Boxes,
  Trophy,
  UserSquare,
  PenLine,
  Lightbulb,
  Coins,
  Globe2,
  Mail,
  type LucideIcon,
} from "lucide-react";

type Section = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const SECTIONS: Section[] = [
  { id: "hero",         label: "Hero",              icon: Home        },
  { id: "projects",     label: "What I Build",      icon: Boxes       },
  { id: "hackathons",   label: "What I Compete In", icon: Trophy      },
  { id: "identity",     label: "What I Bring",      icon: UserSquare  },
  { id: "writing",      label: "What I Write",      icon: PenLine     },
  { id: "perspectives", label: "What I Think",      icon: Lightbulb   },
  { id: "crypto",       label: "Crypto",            icon: Coins       },
  { id: "earth",        label: "Earth",             icon: Globe2      },
  { id: "footer",       label: "Connect",           icon: Mail        },
];

const EDGE_ZONE_PX = 18;          // left strip that triggers reveal on hover
const INACTIVITY_MS = 15_000;     // hero idle threshold for the nudge
const PULSE_MS = 1_200;           // duration of one edge pulse
const PULSE_COUNT = 3;            // glow rhythm count

export function SectionRail() {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [nudging, setNudging] = useState(false);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const activeIdxRef = useRef(0);
  const nudgingRef = useRef(false);
  const openRef = useRef(false);

  useEffect(() => { activeIdxRef.current = activeIdx; }, [activeIdx]);
  useEffect(() => { nudgingRef.current = nudging; },     [nudging]);
  useEffect(() => { openRef.current = open; },           [open]);

  // ---- Active section tracking via IntersectionObserver -------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observed: HTMLElement[] = [];
    const visible = new Map<string, number>(); // id -> intersectionRatio

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
        }
        let bestId: string | null = null;
        let bestRatio = -1;
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestId) {
          const idx = SECTIONS.findIndex((s) => s.id === bestId);
          if (idx >= 0) setActiveIdx(idx);
        }
      },
      { threshold: [0.15, 0.35, 0.55, 0.75] },
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) {
        io.observe(el);
        observed.push(el);
      }
    });

    return () => {
      observed.forEach((el) => io.unobserve(el));
      io.disconnect();
    };
  }, []);

  // ---- Edge hover reveal --------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Touch devices have no hover model; skip wiring entirely.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      if (e.clientX <= EDGE_ZONE_PX) {
        setOpen(true);
      } else if (openRef.current && !nudgingRef.current) {
        // Only collapse when the cursor leaves the rail's own bounds.
        const rail = railRef.current;
        if (!rail) return;
        const r = rail.getBoundingClientRect();
        const inside =
          e.clientX >= r.left - 4 &&
          e.clientX <= r.right + 4 &&
          e.clientY >= r.top - 4 &&
          e.clientY <= r.bottom + 4;
        if (!inside) setOpen(false);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ---- Hero inactivity nudge ---------------------------------------------
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const startNudge = useCallback(() => {
    if (nudgingRef.current) return;
    if (activeIdxRef.current !== 0) return; // hero only
    setNudging(true);
    setOpen(true);
    if (nudgeEndRef.current) clearTimeout(nudgeEndRef.current);
    nudgeEndRef.current = setTimeout(() => {
      setNudging(false);
      setOpen(false);
    }, PULSE_MS * PULSE_COUNT + 100);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const armTimer = () => {
      clearIdleTimer();
      if (reduced.matches) return;                 // no nudge if reduced motion
      if (activeIdxRef.current !== 0) return;      // only at hero
      idleTimerRef.current = setTimeout(startNudge, INACTIVITY_MS);
    };

    const onActivity = () => {
      if (nudgingRef.current) return; // don't reset while the nudge plays out
      armTimer();
    };

    armTimer();
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("mousedown", onActivity, { passive: true });
    window.addEventListener("keydown",   onActivity);
    window.addEventListener("scroll",    onActivity, { passive: true });

    return () => {
      clearIdleTimer();
      if (nudgeEndRef.current) clearTimeout(nudgeEndRef.current);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("mousedown", onActivity);
      window.removeEventListener("keydown",   onActivity);
      window.removeEventListener("scroll",    onActivity);
    };
  }, [clearIdleTimer, startNudge]);

  // Re-arm the idle timer whenever the active section changes (so leaving and
  // returning to hero gets a fresh 15s window).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (activeIdx !== 0) {
      clearIdleTimer();
      return;
    }
    clearIdleTimer();
    idleTimerRef.current = setTimeout(startNudge, INACTIVITY_MS);
  }, [activeIdx, clearIdleTimer, startNudge]);

  // ---- Click navigation --------------------------------------------------
  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Invisible hover trigger pinned to the very left edge. */}
      <div className="rail-edge-zone" aria-hidden />

      <div
        ref={railRef}
        className={`rail ${open ? "rail-open" : ""} ${nudging ? "rail-nudge" : ""}`}
        role="navigation"
        aria-label="Section navigation"
        aria-hidden={!open}
      >
        <span className="rail-edge" aria-hidden />
        <ul className="rail-list">
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            const isActive = i === activeIdx;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  className={`rail-item ${isActive ? "rail-item-active" : ""}`}
                  onClick={() => goTo(section.id)}
                  tabIndex={open ? 0 : -1}
                  aria-label={`Jump to ${section.label}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  <span className="rail-label">{section.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        .rail-edge-zone {
          position: fixed;
          top: 0;
          left: 0;
          width: ${EDGE_ZONE_PX}px;
          height: 100vh;
          z-index: 40;
          pointer-events: auto;
        }
        .rail {
          position: fixed;
          top: 50%;
          left: 0;
          transform: translate(-110%, -50%);
          z-index: 45;
          padding: 10px 8px;
          border-radius: 0 14px 14px 0;
          background-color: color-mix(in srgb, var(--color-surface) 82%, transparent);
          border: 1px solid var(--color-border);
          border-left: none;
          backdrop-filter: blur(14px) saturate(160%);
          -webkit-backdrop-filter: blur(14px) saturate(160%);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 220ms ease;
          opacity: 0;
        }
        .rail-open {
          transform: translate(0, -50%);
          opacity: 1;
        }
        .rail-edge {
          position: absolute;
          top: 0;
          left: 0;
          width: 2px;
          height: 100%;
          background-color: color-mix(in srgb, var(--color-brand) 18%, transparent);
          border-radius: 0 2px 2px 0;
          pointer-events: none;
        }
        .rail-nudge .rail-edge {
          animation: railEdgeGlow ${PULSE_MS}ms ease-in-out ${PULSE_COUNT};
        }
        .rail-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .rail-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          width: 32px;
          padding: 0;
          margin: 0;
          border: none;
          border-radius: 8px;
          background-color: transparent;
          color: var(--color-text-secondary);
          cursor: none;
          transition: color 180ms ease, background-color 180ms ease;
        }
        .rail-item:hover {
          color: var(--color-text-primary);
          background-color: color-mix(in srgb, var(--color-brand) 8%, transparent);
        }
        .rail-item:focus-visible {
          outline: 1.5px solid var(--color-brand);
          outline-offset: 1px;
        }
        /* Free-floating tooltip: lives outside the rail visually, anchored to
           each icon. Not part of the rail frame -- no shared border/background. */
        .rail-label {
          position: absolute;
          top: 50%;
          left: calc(100% + 12px);
          transform: translateY(-50%) translateX(-4px);
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          line-height: 1;
          white-space: nowrap;
          color: var(--color-text-primary);
          padding: 6px 10px;
          border-radius: 6px;
          background-color: color-mix(in srgb, var(--color-surface) 95%, transparent);
          border: 1px solid var(--color-border);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.10);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 140ms ease, transform 180ms ease, visibility 0s linear 140ms;
        }
        .rail-item:hover .rail-label,
        .rail-item:focus-visible .rail-label {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(0);
          transition: opacity 140ms ease, transform 180ms ease, visibility 0s linear 0s;
        }
        .rail-item-active {
          color: var(--color-brand);
          animation: railItemGlow 3s ease-in-out infinite;
        }
        .rail-item-active::before {
          content: "";
          position: absolute;
          left: 2px;
          top: 50%;
          width: 3px;
          height: 14px;
          margin-top: -7px;
          border-radius: 2px;
          background-color: var(--color-brand);
          box-shadow: 0 0 8px color-mix(in srgb, var(--color-brand) 70%, transparent);
        }
        @keyframes railItemGlow {
          0%, 100% {
            filter: drop-shadow(0 0 1px color-mix(in srgb, var(--color-brand) 25%, transparent));
          }
          50% {
            filter: drop-shadow(0 0 6px color-mix(in srgb, var(--color-brand) 75%, transparent));
          }
        }
        @keyframes railEdgeGlow {
          0%, 100% {
            background-color: color-mix(in srgb, var(--color-brand) 18%, transparent);
            box-shadow: 0 0 0 0 transparent;
          }
          50% {
            background-color: color-mix(in srgb, var(--color-brand) 95%, transparent);
            box-shadow: 0 0 14px 2px color-mix(in srgb, var(--color-brand) 55%, transparent);
          }
        }
        /* Nudge mode briefly reveals the rail so the user notices it. */
        .rail-nudge {
          transform: translate(0, -50%);
          opacity: 1;
        }
        /* Hide entirely on touch / coarse-pointer devices -- there's no hover. */
        @media (pointer: coarse) {
          .rail-edge-zone,
          .rail {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rail,
          .rail-item,
          .rail-label,
          .rail-item-active,
          .rail-edge {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
