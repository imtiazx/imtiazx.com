"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Application } from "@splinetool/runtime";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

const SCENE_URL =
  "https://prod.spline.design/HFbFwnHma55H77I2/scene.splinecode";

// Spline OrbitControls autoRotateSpeed default is 2.0; 0.4 = slow drift.
const AUTO_ROTATE_SPEED = 0.4;
// How long after onLoad before we reveal. The prior single-rAF guard let
// Spline's first-frame texture/material warm-up land inside the CSS fade-in,
// which read as a "blink". Combined with no filter chain over the canvas,
// this fully buries the warm-up frames.
const REVEAL_GUARD_MS = 120;

interface SplineBrainProps {
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

export function SplineBrain({ className }: SplineBrainProps) {
  const [canRender, setCanRender] = useState(false);
  // Hides the wrapper until the scene background has been forced transparent
  // AND the warm-up window has passed. Without this, Spline's first-frame
  // intermediate paints (texture decode, material init) read as a flash.
  const [loaded, setLoaded] = useState(false);
  // Bumping this key remounts <Spline>, which is the only reliable way to reset
  // the camera — OrbitControls owns its own spherical state and overrides any
  // direct camera-transform change on the next frame.
  const [sceneKey, setSceneKey] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reducedMotionRef = useRef(false);
  const splineRef = useRef<Application | null>(null);
  // Track whether the scene is currently allowed to run — controlled by the
  // IntersectionObserver below. We call app.stop() when the Hero scrolls
  // offscreen and app.play() when it re-enters, so the WebGL render loop
  // isn't burning frames behind the rest of the page.
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

  // Pause the WebGL render loop when the Hero scrolls offscreen. Resume it
  // when the user comes back. Saves substantial GPU/CPU on long scroll-down
  // sessions where the brain would otherwise keep rotating invisibly.
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
    // Reveal only after a short guard window: the first ~100ms of a Spline
    // scene includes texture decodes + material initialization that paint
    // intermediate frames. Without the guard, those land inside the fade-in
    // and read as the "Spline blink".
    setTimeout(() => setLoaded(true), REVEAL_GUARD_MS);

    if (reducedMotionRef.current) {
      app.stop();
      playingRef.current = false;
      return;
    }
    playingRef.current = true;

    // Enable slow horizontal auto-rotation on the OrbitControls instance.
    // Dragging still works — user input overrides momentarily, then the
    // auto-rotate resumes on the next update tick.
    const oc = (
      app.controls as
        | { orbitControls?: { autoRotate?: boolean; autoRotateSpeed?: number } }
        | undefined
    )?.orbitControls;
    if (oc) {
      oc.autoRotate = true;
      oc.autoRotateSpeed = AUTO_ROTATE_SPEED;
    }
  };

  const resetCamera = () => {
    setLoaded(false); // re-arm the flash guard for the remount
    setSceneKey((k) => k + 1);
  };

  if (!canRender) return null;

  return (
    <div
      ref={wrapRef}
      className={className}
      onDoubleClick={resetCamera}
      style={{
        position: "relative",
        opacity: loaded ? 1 : 0,
        transition: "opacity 350ms ease",
        // Let the Spline canvas own pointer + touch gestures for orbit/zoom
        // without the browser hijacking them for page scroll.
        pointerEvents: "auto",
        touchAction: "none",
      }}
    >
      {/* Ambient orange halo. Sits BEHIND the transparent Spline canvas, so
          the brand color bleeds through wherever the brain mesh isn't drawing.
          This is the "tint" without paying the cost of a CSS filter chain
          over a live canvas (the earlier approach that caused lag). Only
          opacity animates, which the compositor handles on the GPU. */}
      <div
        aria-hidden
        className="spline-brain-halo"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-brand) 22%, transparent) 0%, color-mix(in srgb, var(--color-brand) 8%, transparent) 38%, transparent 65%)",
          willChange: "opacity",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        <SplineErrorBoundary>
          <Spline
            key={sceneKey}
            scene={SCENE_URL}
            onLoad={handleLoad}
            style={{ background: "transparent" }}
          />
        </SplineErrorBoundary>
      </div>

      <style jsx>{`
        .spline-brain-halo {
          animation: splineBrainPulse 6.5s ease-in-out infinite;
        }
        @keyframes splineBrainPulse {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 1;   }
        }
        @media (prefers-reduced-motion: reduce) {
          .spline-brain-halo { animation: none; opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
