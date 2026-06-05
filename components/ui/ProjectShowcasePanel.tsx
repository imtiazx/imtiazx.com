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

const PANEL_W = 440;
const PANEL_H = 380;
const IMAGE_H = 190;
const CURSOR_OFFSET_X = 28;
const CURSOR_OFFSET_Y = 28;
const SLIDE_MS = 2500;
const LERP = 0.18;

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
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow:
          "0 28px 60px rgba(0, 0, 0, 0.22), 0 10px 24px rgba(0, 0, 0, 0.12)",
        willChange: "transform, opacity",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image area — top portion. Holds the crossfading stack. */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: IMAGE_H,
          flexShrink: 0,
          overflow: "hidden",
          backgroundColor: "var(--color-surface-alt)",
        }}
      >
        {/* Fallback gradient behind images (visible if any image 404s). */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-surface-alt) 100%)",
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
              transform: i === slide ? "scale(1)" : "scale(1.05)",
              transition:
                "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 1600ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        ))}

        {/* Slide indicator dots, dark pill backdrop for legibility on any image. */}
        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "flex",
              gap: 6,
              alignItems: "center",
              padding: "5px 9px",
              borderRadius: 9999,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
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
                      : "rgba(255, 255, 255, 0.45)",
                  transition: "background-color 240ms ease-out",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Copy block — theme-adaptive surface, theme-adaptive text. */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "18px 22px 20px",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: 20,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-sans)",
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
            marginTop: 10,
            color: "var(--color-text-secondary)",
          }}
        >
          {description}
        </p>
      </div>
    </div>,
    document.body,
  );
}
