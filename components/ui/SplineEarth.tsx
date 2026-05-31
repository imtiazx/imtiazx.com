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
  // Hides the wrapper until the scene background has been forced transparent,
  // otherwise Spline's default scene BG flashes for ~1 frame.
  const [loaded, setLoaded] = useState(false);
  const reducedMotionRef = useRef(false);
  const splineRef = useRef<Application | null>(null);

  useEffect(() => {
    setCanRender(webglAvailable());

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      if (e.matches && splineRef.current) {
        splineRef.current.stop();
      }
    };
    mq.addEventListener("change", onMotionChange);

    return () => {
      mq.removeEventListener("change", onMotionChange);
    };
  }, []);

  const handleLoad = (app: Application) => {
    splineRef.current = app;
    app.setBackgroundColor("rgba(0,0,0,0)");
    requestAnimationFrame(() => setLoaded(true));
    if (reducedMotionRef.current) {
      app.stop();
    }
  };

  if (!canRender) return null;

  return (
    <div
      className={className}
      style={{
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.5s ease",
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
