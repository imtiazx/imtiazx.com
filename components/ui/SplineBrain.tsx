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
  "https://prod.spline.design/9vLKae8a2HyRt6oH/scene.splinecode";

// Tints the Spline particles toward brand orange (#EA580C light / #FB923C dark).
// sepia normalizes hue to warm brown; hue-rotate dials it to orange; saturate +
// brightness/contrast tune for theme.
const LIGHT_FILTER =
  "sepia(1) hue-rotate(-15deg) saturate(3.2) brightness(0.95) contrast(1.05)";
const DARK_FILTER =
  "sepia(1) hue-rotate(-10deg) saturate(2.8) brightness(1.1) contrast(1.1)";

// Spline OrbitControls autoRotateSpeed default is 2.0; 0.4 = slow drift.
const AUTO_ROTATE_SPEED = 0.4;

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
  const [isDark, setIsDark] = useState(false);
  const [canRender, setCanRender] = useState(false);
  // Hides the wrapper until the scene background has been forced transparent.
  // Without this, Spline's default scene BG paints for ~1 frame and the orange
  // CSS filter turns it into a solid orange flash.
  const [loaded, setLoaded] = useState(false);
  // Bumping this key remounts <Spline>, which is the only reliable way to reset
  // the camera — OrbitControls owns its own spherical state and overrides any
  // direct camera-transform change on the next frame.
  const [sceneKey, setSceneKey] = useState(0);
  const reducedMotionRef = useRef(false);
  const splineRef = useRef<Application | null>(null);

  useEffect(() => {
    setCanRender(webglAvailable());

    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

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
      observer.disconnect();
      mq.removeEventListener("change", onMotionChange);
    };
  }, []);

  const handleLoad = (app: Application) => {
    splineRef.current = app;
    app.setBackgroundColor("rgba(0,0,0,0)");
    // Reveal on the next frame so the transparent BG is painted before we
    // fade the (filter-tinted) wrapper in.
    requestAnimationFrame(() => setLoaded(true));
    if (reducedMotionRef.current) {
      app.stop();
      return;
    }

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
      className={className}
      onDoubleClick={resetCamera}
      style={{
        filter: isDark ? DARK_FILTER : LIGHT_FILTER,
        // `screen` blend keeps bright particles visible while letting the
        // brain's dark internal mesh dissolve into the page background.
        // Works in both themes.
        mixBlendMode: "screen",
        opacity: loaded ? 1 : 0,
        transition: "filter 0.4s ease, opacity 0.35s ease",
        // Let the Spline canvas own pointer + touch gestures for orbit/zoom
        // without the browser hijacking them for page scroll.
        pointerEvents: "auto",
        touchAction: "none",
      }}
    >
      <SplineErrorBoundary>
        <Spline
          key={sceneKey}
          scene={SCENE_URL}
          onLoad={handleLoad}
          style={{ background: "transparent" }}
        />
      </SplineErrorBoundary>
    </div>
  );
}
