"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Application } from "@splinetool/runtime";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

// Bump this when you republish the Spline scene — Spline keeps the same URL
// after republish, so the browser will serve the cached scene unless we
// change the query string.
const SCENE_URL =
  "https://prod.spline.design/h2ff9MB-DMQigZfl/scene.splinecode?v=20260531";

// Reveal guard: lets Spline's first-frame texture/material warm-up land
// before we begin the fade-in, so the warm-up paints aren't visible.
const REVEAL_GUARD_MS = 120;

interface SplineEarthProps {
  className?: string;
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

class SplineErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function SplineEarth({ className }: SplineEarthProps) {
  const [canRender, setCanRender] = useState(false);
  // Hides the wrapper until the scene background has been forced transparent
  // and the warm-up window has passed.
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reducedMotionRef = useRef(false);
  const splineRef = useRef<Application | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    setCanRender(webglAvailable());

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      if (e.matches && splineRef.current) {
        splineRef.current.stop();
        playingRef.current = false;
      }
    };
    mq.addEventListener("change", onMotionChange);

    return () => {
      mq.removeEventListener("change", onMotionChange);
    };
  }, []);

  // Pause the WebGL render loop while Earth is offscreen. EarthSection already
  // gates the mount itself behind `useInView`, so this layer mainly catches
  // the case where the user scrolls past Earth into Footer.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const app = splineRef.current;
          if (!app) continue;
          if (entry.isIntersecting && !reducedMotionRef.current) {
            if (!playingRef.current) {
              app.play();
              playingRef.current = true;
            }
          } else {
            if (playingRef.current) {
              app.stop();
              playingRef.current = false;
            }
          }
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleLoad = (app: Application) => {
    splineRef.current = app;
    app.setBackgroundColor("rgba(0,0,0,0)");
    setTimeout(() => setLoaded(true), REVEAL_GUARD_MS);
    if (reducedMotionRef.current) {
      app.stop();
      playingRef.current = false;
    } else {
      playingRef.current = true;
    }
  };

  if (!canRender) return null;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        opacity: loaded ? 1 : 0,
        transition: "opacity 500ms ease",
        pointerEvents: "auto",
        touchAction: "none",
      }}
    >
      <SplineErrorBoundary>
        <Spline
          scene={SCENE_URL}
          onLoad={handleLoad}
          style={{ background: "transparent" }}
        />
      </SplineErrorBoundary>
    </div>
  );
}
