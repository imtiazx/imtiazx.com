"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  // Distance (px or %) to inflate the viewport before considering the element
  // "in view". A small positive value preloads animations just before they
  // scroll on; "100%" preloads ~1 viewport ahead, useful for deferring heavy
  // Spline / canvas work.
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Returns `[ref, inView]`. The animation loops on this homepage share one
 * concern: when their section is not on screen, stop the RAF / interval /
 * SVG packets. Attach the ref to the section root and gate the loop on
 * `inView`. On unsupported environments (SSR), defaults to `true` so nothing
 * regresses on first paint.
 */
export function useInView<T extends HTMLElement>(
  options: Options = {},
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
        }
      },
      {
        rootMargin: options.rootMargin ?? "0px",
        threshold: options.threshold ?? 0,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [options.rootMargin, options.threshold]);

  return [ref, inView];
}
