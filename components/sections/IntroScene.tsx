"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { SymbolCloud } from "@/components/intro/SymbolCloud";
import { IntroLogo } from "@/components/intro/IntroLogo";

const IDLE_MS = 30000; // 30s of inactivity before landing on the homepage
const THEME_CYCLE: Theme[] = ["system", "light", "dark"];

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "dark") return <Moon size={16} />;
  if (theme === "system") return <Monitor size={16} />;
  return <Sun size={16} />;
}

export function IntroScene() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  // Flipped on click/idle/keydown. Tells SymbolCloud to stop its RAF
  // immediately so the main thread is free for /home compile + Spline fetch.
  const [leaving, setLeaving] = useState(false);

  const handleThemeToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger the gateway's click-to-enter
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  // SymbolCloud wants a concrete light/dark. "system" only lives in the
  // provider; the resolved value is whatever .dark class is actually applied.
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const compute = () =>
      setResolvedTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    compute();
    const observer = new MutationObserver(compute);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [theme]);

  // Prefetch so the idle handoff to the homepage is instant.
  useEffect(() => {
    router.prefetch("/home");
    // Warm the browser cache for the 3D scene file the Hero will request, so
    // /home's first paint isn't blocked on a third-party CDN roundtrip.
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "fetch";
    link.crossOrigin = "anonymous";
    link.href = "https://prod.spline.design/9vLKae8a2HyRt6oH/scene.splinecode";
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [router]);

  const navigatedRef = useRef(false);
  const enterHome = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    setLeaving(true);
    // Defer the push by one frame so React commits `leaving=true` and the
    // canvas RAF halts before /home starts mounting. Without this the
    // SymbolCloud loop keeps stealing CPU during the heavy route work.
    requestAnimationFrame(() => router.push("/home"));
  }, [router]);

  const handleSceneClick = useCallback(() => {
    if (navigatedRef.current) return;
    enterHome();
  }, [enterHome]);

  // Idle timer: any pointer / key / touch activity resets the 30s countdown.
  // The cloud reacts to the cursor; once the visitor stops, we move on.
  useEffect(() => {
    let timer = window.setTimeout(enterHome, IDLE_MS);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(enterHome, IDLE_MS);
    };
    const events: (keyof WindowEventMap)[] = [
      "pointermove",
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart",
      "touchmove",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [enterHome]);

  // Explicit intent to proceed.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") enterHome();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterHome]);

  // Lock body scroll while the gateway owns the screen; restore on handoff.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      id="intro-scene"
      data-intro-scene
      onClick={handleSceneClick}
      style={{
        // In-flow (not fixed): PageTransition wraps page content in a
        // transformed motion.div, which would otherwise re-anchor a fixed
        // child. Absolute children resolve against this relative box instead.
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <SymbolCloud theme={resolvedTheme} paused={leaving} />
      <IntroLogo />

      <button
        type="button"
        onClick={handleThemeToggle}
        aria-label={`Switch theme (current: ${theme})`}
        className="intro-theme-toggle"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 20,
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 9,
          color: "var(--color-brand)",
          background: "transparent",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "color-mix(in srgb, var(--color-brand) 28%, transparent)",
          cursor: "pointer",
          transition: "background-color 200ms ease",
        }}
      >
        <ThemeIcon theme={theme} />
      </button>

      <style jsx>{`
        .intro-theme-toggle:hover {
          background-color: color-mix(in srgb, var(--color-brand) 12%, transparent);
        }
      `}</style>
    </div>
  );
}
