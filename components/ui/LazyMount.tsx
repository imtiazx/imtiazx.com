"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useInView } from "@/lib/useInView";

interface LazyMountProps {
  children: ReactNode;
  // Pre-mount distance ahead of the viewport. Default of "300px" gives the
  // section just under half a viewport of lead time so it's ready by the
  // time the user scrolls onto it.
  rootMargin?: string;
  // Approximate height reserved while children are not yet mounted, so the
  // scroll position doesn't jump when sections appear. Cleared once mounted.
  minHeight?: number | string;
  className?: string;
}

/**
 * Renders nothing until the wrapper enters the IntersectionObserver root
 * margin, at which point it mounts `children` and keeps them mounted (no
 * re-mount churn if the user scrolls away and back).
 *
 * Used on /home to spread hydration cost across the scroll instead of forcing
 * the dev runtime to hydrate every section's heavy client tree at once.
 */
export function LazyMount({
  children,
  rootMargin = "300px",
  minHeight,
  className,
}: LazyMountProps) {
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  return (
    <div
      ref={ref}
      className={className}
      style={!mounted && minHeight !== undefined ? { minHeight } : undefined}
    >
      {mounted ? children : null}
    </div>
  );
}
