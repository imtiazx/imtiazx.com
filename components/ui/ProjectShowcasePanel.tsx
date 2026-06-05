"use client";

import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";

interface ProjectShowcasePanelProps {
  visible: boolean;
  // Parent writes raw clientX/Y here on every mousemove (no React re-render).
  // The panel reads it inside its own rAF loop and lerps toward it.
  mouseRef: MutableRefObject<{ x: number; y: number }>;
  title: string;
  tagline: string;
  description: string;
  images: string[];
}

// 16:9 landscape — matches the screenshot aspect ratio so images stay sharp.
const PANEL_W = 640;
const PANEL_H = 360;
const CURSOR_OFFSET_X = 28;
const CURSOR_OFFSET_Y = 28;
const SLIDE_MS = 2500;
const LERP = 0.18;

// The panel sits on top of the project's app screenshots, which are
// light-themed regardless of the site's theme. Text colors are intentionally
// fixed to dark stone shades so they read on the white scrim in both modes.
const TEXT_TITLE = "#1C1917";
const TEXT_BODY = "#44403C";

export function ProjectShowcasePanel({
  visible,
  mouseRef,
  title,
  tagline,
  description,
  images,
}: ProjectShowcasePanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [slide, setSlide] = useState(0);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setViewport({ w: window.innerWidth, h: window.innerHeight });
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Snap to cursor on appear, then run a lerp loop while visible.
  useEffect(() => {
    if (!visible) return;
    setPos({ ...mouseRef.current });
    setSlide(0);

    if (prefersReducedMotion) return;

    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
    const tick = () => {
      setPos((prev) => ({
        x: lerp(prev.x, mouseRef.current.x, LERP),
        y: lerp(prev.y, mouseRef.current.y, LERP),
      }));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, prefersReducedMotion, mouseRef]);

  // Crossfade auto-advance — only while visible and motion is allowed.
  useEffect(() => {
    if (!visible || prefersReducedMotion || images.length <= 1) return;
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % images.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [visible, prefersReducedMotion, images.length]);

  if (!mounted) return null;

  // Clamp panel inside viewport so it never half-leaves the screen.
  const safeX = viewport.w
    ? Math.min(Math.max(pos.x + CURSOR_OFFSET_X, 12), viewport.w - PANEL_W - 12)
    : pos.x + CURSOR_OFFSET_X;
  const safeY = viewport.h
    ? Math.min(Math.max(pos.y + CURSOR_OFFSET_Y, 12), viewport.h - PANEL_H - 12)
    : pos.y + CURSOR_OFFSET_Y;

  return createPortal(
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: PANEL_W,
        height: PANEL_H,
        transform: `translate3d(${safeX}px, ${safeY}px, 0)`,
        pointerEvents: "none",
        zIndex: 60,
        opacity: visible ? 1 : 0,
        transition: "opacity 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        boxShadow:
          "0 28px 60px rgba(0, 0, 0, 0.28), 0 10px 24px rgba(0, 0, 0, 0.14)",
        willChange: "transform, opacity",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Fallback gradient — visible until images load or if any 404. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, var(--color-brand-light) 0%, #ffffff 100%)",
        }}
      />

      {/* Stacked images, opacity-driven crossfade with subtle zoom. Plain
          <img> on purpose: 4 small panel images, all preloaded for instant
          crossfade — next/image's optimization machinery adds no value here. */}
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          loading="eager"
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === slide ? 1 : 0,
            transform: i === slide ? "scale(1)" : "scale(1.04)",
            transition:
              "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 1600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      ))}

      {/* Bottom scrim — white wash that fades up, gives the text a readable
          background while leaving the upper half of the image clean. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 28%, rgba(255,255,255,0.35) 58%, rgba(255,255,255,0) 78%)",
        }}
      />

      {/* Slide indicator dots — dark glass pill so they stay legible on any
          screenshot background. */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            display: "flex",
            gap: 6,
            alignItems: "center",
            padding: "5px 9px",
            borderRadius: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.42)",
            backdropFilter: "blur(4px)",
            zIndex: 2,
          }}
        >
          {images.map((src, i) => (
            <span
              key={src}
              style={{
                width: 5,
                height: 5,
                borderRadius: 9999,
                backgroundColor:
                  i === slide
                    ? "var(--color-brand)"
                    : "rgba(255, 255, 255, 0.55)",
                transition: "background-color 240ms ease-out",
              }}
            />
          ))}
        </div>
      )}

      {/* Copy block — pinned to the bottom of the panel, dark text on the
          white scrim above. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "0 26px 22px",
          zIndex: 1,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 20,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: TEXT_TITLE,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: 13,
            lineHeight: 1.4,
            marginTop: 4,
            color: "var(--color-brand)",
          }}
        >
          {tagline}
        </p>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12.5,
            lineHeight: 1.55,
            marginTop: 8,
            color: TEXT_BODY,
          }}
        >
          {description}
        </p>
      </div>
    </div>,
    document.body,
  );
}
