"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { person } from "@/lib/person";

const STORAGE_KEY = "imtiazx_loader_seen";

export function PageLoader() {
  const [render, setRender] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    setRender(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage blocked */
    }
  }, []);

  useEffect(() => {
    if (!render) return;
    const root = rootRef.current;
    const word = wordRef.current;
    if (!root || !word) return;

    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setRender(false);
        },
      });
      tl.fromTo(word, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
        .to({}, { duration: 0.5 })
        .to(root, { yPercent: -100, duration: 0.6, ease: "power3.in" });
    }, root);

    return () => {
      document.body.style.overflow = "";
      ctx.revert();
    };
  }, [render]);

  if (!render) return null;

  const handle = person.handle;
  const base = handle.endsWith(".") ? handle.slice(0, -1) : handle;
  const head = base.slice(0, -1);
  const tail = base.slice(-1);

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        backgroundColor: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={wordRef}
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--color-text-primary)",
          fontSize: "clamp(3rem, 10vw, 6rem)",
          lineHeight: 1,
          opacity: 0,
        }}
      >
        {head}
        <span style={{ color: "var(--color-brand)" }}>{tail}</span>
      </div>
    </div>
  );
}
