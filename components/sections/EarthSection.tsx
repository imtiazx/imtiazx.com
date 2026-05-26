"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const actions = [
  "offset your cloud compute emissions.",
  "switch your team to a green hosting provider.",
  "plant one tree this month. just one.",
  "compost your food waste. it cuts methane at the source.",
  "audit your ML pipeline's carbon footprint.",
  "repair before you replace. e-waste is the fastest growing waste stream on earth.",
  "support open energy data initiatives.",
  "walk or cycle for short distances. your body and the grid both win.",
  "talk about this. loudly. at work.",
  "vote for people who take this seriously.",
];

// ----------------------------------------------------------------------------
// Tux building blocks
// ----------------------------------------------------------------------------

interface BabyConfig {
  id: string;
  variant: "curious" | "sleepy" | "adventurer";
  facing?: "left" | "right";
}

function TuxBaby({ id, variant, facing = "left" }: BabyConfig) {
  const flip = facing === "right" ? "scale(-1, 1) " : "";
  return (
    <g id={id}>
      <g id={`${id}-flipper-l`}>
        <ellipse cx="-22" cy="-2" rx="6" ry="18" fill="#0A0A0A" transform="rotate(-10 -22 -2)" />
      </g>
      <g id={`${id}-flipper-r`}>
        <ellipse cx="22" cy="-2" rx="6" ry="18" fill="#0A0A0A" transform="rotate(10 22 -2)" />
      </g>

      <g id={`${id}-body`}>
        <ellipse cx="0" cy="0" rx="24" ry="34" fill="#0A0A0A" />
        <ellipse cx="0" cy="4" rx="14" ry="24" fill="#FFFFFF" />
      </g>

      <rect x="-9" y="30" width="7" height="5" rx="2" fill="var(--color-brand)" />
      <rect x="2"  y="30" width="7" height="5" rx="2" fill="var(--color-brand)" />

      <g id={`${id}-head`} transform={flip}>
        <circle cx="0" cy="-38" r="20" fill="#0A0A0A" />
        <ellipse cx="0" cy="-37" rx="13" ry="10" fill="#FFFFFF" />

        <g id={`${id}-eye-l`}>
          <circle cx="-6" cy="-40" r="4" fill="#FFFFFF" />
          <circle id={`${id}-pupil-l`} cx="-5.5" cy="-39.5" r="2.2" fill="#0A0A0A" />
          <circle cx="-5" cy="-41" r="0.9" fill="#FFFFFF" />
        </g>
        <g id={`${id}-eye-r`}>
          <circle cx="6" cy="-40" r="4" fill="#FFFFFF" />
          <circle id={`${id}-pupil-r`} cx="6.5" cy="-39.5" r="2.2" fill="#0A0A0A" />
          <circle cx="7" cy="-41" r="0.9" fill="#FFFFFF" />
        </g>

        <polygon points="0,-32 8,-30 0,-28" fill="var(--color-brand)" />
      </g>

      {variant === "curious" && (
        <text
          id={`${id}-question`}
          x="0"
          y="-65"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="14"
          fill="#FFFFFF"
          opacity="0"
        >
          ?
        </text>
      )}
      {variant === "sleepy" && (
        <g id={`${id}-zzz`} opacity="0">
          <text x="-2" y="-66" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10" fill="#FFFFFF">z</text>
          <text x="6" y="-72" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="8" fill="#FFFFFF">z</text>
        </g>
      )}
    </g>
  );
}

function TuxMom() {
  return (
    <g id="tux-mom">
      <g id="tux-mom-flipper-l">
        <ellipse cx="-38" cy="0" rx="10" ry="32" fill="#0A0A0A" transform="rotate(-12 -38 0)" />
      </g>
      <g id="tux-mom-flipper-r">
        <ellipse cx="38" cy="0" rx="10" ry="32" fill="#0A0A0A" transform="rotate(12 38 0)" />
      </g>

      <g id="tux-mom-body">
        <ellipse cx="0" cy="0" rx="42" ry="58" fill="#0A0A0A" />
        <ellipse cx="0" cy="4" rx="24" ry="40" fill="#FFFFFF" />
        <ellipse cx="0" cy="6" rx="18" ry="32" fill="#F4F1EC" opacity="0.6" />
      </g>

      <g id="tux-mom-feet">
        <rect x="-16" y="52" width="12" height="8" rx="3" fill="var(--color-brand)" />
        <rect x="4"   y="52" width="12" height="8" rx="3" fill="var(--color-brand)" />
      </g>

      <g id="tux-mom-head">
        <circle cx="0" cy="-66" r="38" fill="#0A0A0A" />
        <ellipse cx="0" cy="-64" rx="22" ry="16" fill="#FFFFFF" />

        <path d="M -16 -76 Q -11 -80 -6 -77" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />
        <path d="M 16 -76 Q 11 -80 6 -77"   stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />

        <g id="tux-mom-eye-l">
          <circle cx="-12" cy="-68" r="7" fill="#FFFFFF" />
          <circle id="tux-mom-pupil-l" cx="-11" cy="-67" r="4" fill="#0A0A0A" />
          <circle cx="-10" cy="-69" r="1.5" fill="#FFFFFF" />
        </g>
        <g id="tux-mom-eye-r">
          <circle cx="12" cy="-68" r="7" fill="#FFFFFF" />
          <circle id="tux-mom-pupil-r" cx="13" cy="-67" r="4" fill="#0A0A0A" />
          <circle cx="14" cy="-69" r="1.5" fill="#FFFFFF" />
        </g>

        <polygon points="0,-58 14,-54 0,-50" fill="var(--color-brand)" />
      </g>
    </g>
  );
}

// ----------------------------------------------------------------------------
// TuxScene
// ----------------------------------------------------------------------------

const STAR_POSITIONS: Array<{ x: number; y: number; r: number; o: number }> = [
  { x: 25,  y: 32,  r: 1.2, o: 0.6 },
  { x: 60,  y: 18,  r: 0.9, o: 0.4 },
  { x: 90,  y: 50,  r: 1.5, o: 0.7 },
  { x: 130, y: 28,  r: 1.0, o: 0.5 },
  { x: 170, y: 65,  r: 0.8, o: 0.3 },
  { x: 200, y: 22,  r: 1.6, o: 0.8 },
  { x: 235, y: 48,  r: 1.1, o: 0.5 },
  { x: 268, y: 12,  r: 0.9, o: 0.4 },
  { x: 295, y: 56,  r: 1.3, o: 0.6 },
  { x: 330, y: 30,  r: 1.0, o: 0.5 },
  { x: 358, y: 70,  r: 0.8, o: 0.35 },
  { x: 388, y: 24,  r: 1.4, o: 0.7 },
  { x: 415, y: 52,  r: 1.0, o: 0.45 },
  { x: 445, y: 18,  r: 1.2, o: 0.55 },
  { x: 475, y: 60,  r: 0.9, o: 0.4 },
  { x: 45,  y: 90,  r: 1.1, o: 0.5 },
  { x: 110, y: 110, r: 1.4, o: 0.6 },
  { x: 165, y: 100, r: 0.8, o: 0.35 },
  { x: 220, y: 120, r: 1.0, o: 0.5 },
  { x: 285, y: 95,  r: 1.5, o: 0.7 },
  { x: 345, y: 115, r: 0.9, o: 0.4 },
  { x: 400, y: 100, r: 1.2, o: 0.55 },
  { x: 455, y: 130, r: 1.0, o: 0.5 },
  { x: 75,  y: 150, r: 0.8, o: 0.3 },
  { x: 145, y: 165, r: 1.3, o: 0.6 },
  { x: 215, y: 155, r: 0.9, o: 0.4 },
  { x: 305, y: 170, r: 1.1, o: 0.5 },
  { x: 375, y: 158, r: 0.8, o: 0.35 },
  { x: 430, y: 175, r: 1.4, o: 0.7 },
  { x: 15,  y: 145, r: 1.0, o: 0.45 },
];

function TuxScene({ reduced }: { reduced: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let xTos: Array<ReturnType<typeof gsap.quickTo>> = [];
    let yTos: Array<ReturnType<typeof gsap.quickTo>> = [];

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.globalTimeline.pause();
        return;
      }

      // Mom breathing
      gsap.to("#tux-mom-body", {
        scaleY: 1.015,
        transformOrigin: "center bottom",
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Mom eye blink
      gsap.timeline({ repeat: -1, repeatDelay: 4.5 })
        .to(["#tux-mom-eye-l", "#tux-mom-eye-r"], {
          scaleY: 0.05,
          transformOrigin: "center",
          duration: 0.08,
          ease: "power2.in",
        })
        .to(["#tux-mom-eye-l", "#tux-mom-eye-r"], {
          scaleY: 1,
          duration: 0.1,
          ease: "power2.out",
        });

      // Mom head sway
      gsap.timeline({ repeat: -1, repeatDelay: 6 })
        .to("#tux-mom-head", {
          rotation: -8,
          duration: 1.2,
          ease: "sine.inOut",
          transformOrigin: "bottom center",
        })
        .to("#tux-mom-head", { rotation: 6, duration: 1.5, ease: "sine.inOut" })
        .to("#tux-mom-head", { rotation: 0, duration: 1, ease: "sine.inOut" });

      // Baby 1 waddle (curious)
      gsap.to("#tux-baby-1", {
        x: 8,
        rotation: 5,
        duration: 0.9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "center bottom",
      });
      // Baby 1 question mark appears occasionally
      gsap.timeline({ repeat: -1, repeatDelay: 5 })
        .to("#tux-baby-1-question", { opacity: 1, y: -4, duration: 0.4, ease: "back.out(2)" })
        .to("#tux-baby-1-question", { opacity: 0, y: 0, duration: 0.4, ease: "power1.in" }, "+=1.5");

      // Baby 2 sleeping
      gsap.to("#tux-baby-2", {
        rotation: 3,
        y: 2,
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "center bottom",
      });
      gsap.to("#tux-baby-2-zzz", {
        opacity: 1,
        y: -6,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Baby 3 slow walk
      gsap.timeline({ repeat: -1 })
        .to("#tux-baby-3", { x: 20, duration: 8, ease: "none" })
        .to("#tux-baby-3", { x: 0, duration: 0.1, ease: "none" });

      // Mom flipper wave
      gsap.timeline({ repeat: -1, repeatDelay: 7 })
        .to("#tux-mom-flipper-r", {
          rotation: -25,
          duration: 0.4,
          ease: "power2.out",
          transformOrigin: "top left",
        })
        .to("#tux-mom-flipper-r", { rotation: 0, duration: 0.5, ease: "power2.in" })
        .to("#tux-mom-flipper-r", { rotation: -18, duration: 0.3, ease: "power2.out" })
        .to("#tux-mom-flipper-r", { rotation: 0, duration: 0.4, ease: "power2.in" });

      // Stars twinkle
      gsap.to(".tux-star", {
        opacity: "random(0.2, 0.9)",
        duration: "random(2, 5)",
        stagger: { each: 0.3, from: "random" },
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Cracks: set up draw-on animation, triggered on scroll into view
      const cracks = svg.querySelectorAll<SVGPathElement>(".ice-crack");
      cracks.forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      });

      ScrollTrigger.create({
        trigger: svg,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(cracks, {
            strokeDashoffset: 0,
            duration: 2,
            ease: "power2.inOut",
          });
          gsap.fromTo(
            "#tux-baby-2",
            { y: 2 },
            { y: -5, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out" }
          );
          gsap.to("#tux-mom", {
            x: -3,
            duration: 1.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
          });
        },
      });

      // Eye tracking quickTo handlers (mom + babies with visible pupils).
      // Created inside ctx so they're tracked and reverted with the context.
      const pupilTargets = [
        "#tux-mom-pupil-l",
        "#tux-mom-pupil-r",
        "#tux-baby-1-pupil-l",
        "#tux-baby-1-pupil-r",
        "#tux-baby-2-pupil-l",
        "#tux-baby-2-pupil-r",
        "#tux-baby-3-pupil-l",
        "#tux-baby-3-pupil-r",
      ];
      xTos = pupilTargets.map((sel) =>
        gsap.quickTo(sel, "x", { duration: 0.3, ease: "power3" })
      );
      yTos = pupilTargets.map((sel) =>
        gsap.quickTo(sel, "y", { duration: 0.3, ease: "power3" })
      );
    }, svg);

    // Mousemove listener lives outside gsap.context to avoid a temporal
    // dead zone on `ctx`. Cleanup happens in the effect return below.
    const onMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      const dx = Math.max(-1, Math.min(1, nx * 2)) * 2;
      const dy = Math.max(-1, Math.min(1, ny * 2)) * 2;
      xTos.forEach((fn) => fn(dx));
      yTos.forEach((fn) => fn(dy));
    };

    if (!reduced) {
      svg.addEventListener("mousemove", onMove);
    }

    return () => {
      svg.removeEventListener("mousemove", onMove);
      ctx.revert();
    };
  }, [reduced]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 500 400"
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="A mother penguin watching three baby penguins on a starlit ice shelf as cracks spread beneath them."
    >
      <defs>
        <filter id="aurora-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <radialGradient id="ice-light" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Aurora */}
      <g className="tux-aurora">
        <ellipse cx="140" cy="120" rx="200" ry="80" fill="rgba(0, 255, 100, 0.04)" filter="url(#aurora-blur)" />
        <ellipse cx="320" cy="80"  rx="240" ry="70" fill="rgba(0, 200, 150, 0.05)" filter="url(#aurora-blur)" />
        <ellipse cx="250" cy="170" rx="220" ry="60" fill="rgba(100, 255, 200, 0.03)" filter="url(#aurora-blur)" />
      </g>

      {/* Stars */}
      <g className="tux-stars">
        {STAR_POSITIONS.map((s, i) => (
          <circle
            key={i}
            className="tux-star"
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#FFFFFF"
            opacity={s.o}
          />
        ))}
      </g>

      {/* Deep ice shadow */}
      <ellipse cx="250" cy="395" rx="240" ry="14" fill="#040A05" opacity="0.7" />

      {/* Ice shelf */}
      <g>
        <rect x="20" y="305" width="460" height="80" rx="40" fill="#C8E6F0" />
        <ellipse cx="250" cy="310" rx="200" ry="14" fill="url(#ice-light)" />
        <ellipse cx="250" cy="308" rx="170" ry="6" fill="#E8F4F8" opacity="0.7" />
      </g>

      {/* Cracks (animated on scroll) */}
      <path
        className="ice-crack"
        d="M 140 330 L 105 360 M 130 340 L 130 372"
        stroke="#2A5A6A"
        strokeWidth="1"
        fill="none"
      />
      <path
        className="ice-crack"
        d="M 320 332 L 360 358 M 335 342 L 342 376"
        stroke="#2A5A6A"
        strokeWidth="1"
        fill="none"
      />
      <path
        className="ice-crack"
        d="M 250 340 L 250 378 M 240 358 L 222 375 M 260 358 L 278 375"
        stroke="#2A5A6A"
        strokeWidth="1"
        fill="none"
      />

      {/* Baby 3: far right, adventurer */}
      <g transform="translate(430 290) scale(0.4)" id="tux-baby-3-wrap">
        <g id="tux-baby-3">
          <TuxBaby id="tux-baby-3" variant="adventurer" facing="right" />
        </g>
        {/* footprints behind baby 3 */}
        <g opacity="0.4">
          <ellipse cx="-40" cy="50" rx="3" ry="2" fill="var(--color-brand)" />
          <ellipse cx="-58" cy="56" rx="3" ry="2" fill="var(--color-brand)" />
        </g>
      </g>

      {/* Baby 1: left of mom */}
      <g transform="translate(155 270) scale(0.55) rotate(-8)">
        <TuxBaby id="tux-baby-1" variant="curious" />
      </g>

      {/* Baby 2: right of mom */}
      <g transform="translate(345 275) scale(0.55) rotate(6)">
        <TuxBaby id="tux-baby-2" variant="sleepy" />
      </g>

      {/* Mom: center */}
      <g transform="translate(250 240)">
        <TuxMom />
      </g>
    </svg>
  );
}

// ----------------------------------------------------------------------------
// Typewriter
// ----------------------------------------------------------------------------
type TypewriterMode = "typing" | "pauseFull" | "deleting" | "pauseEmpty";

function Typewriter({ reduced }: { reduced: boolean }) {
  const [actionIdx, setActionIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [mode, setMode] = useState<TypewriterMode>("typing");

  useEffect(() => {
    if (reduced) return;
    const action = actions[actionIdx];
    let timeoutId: ReturnType<typeof setTimeout>;

    if (mode === "typing") {
      if (displayed.length < action.length) {
        timeoutId = setTimeout(
          () => setDisplayed(action.slice(0, displayed.length + 1)),
          45,
        );
      } else {
        timeoutId = setTimeout(() => setMode("pauseFull"), 0);
      }
    } else if (mode === "pauseFull") {
      timeoutId = setTimeout(() => setMode("deleting"), 2000);
    } else if (mode === "deleting") {
      if (displayed.length > 0) {
        timeoutId = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 25);
      } else {
        timeoutId = setTimeout(() => setMode("pauseEmpty"), 0);
      }
    } else {
      timeoutId = setTimeout(() => {
        setActionIdx((i) => (i + 1) % actions.length);
        setMode("typing");
      }, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [displayed, mode, actionIdx, reduced]);

  const shown = reduced ? actions[0] : displayed;

  return (
    <div
      className="mt-8"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: "#F5F0EB",
        lineHeight: 1.6,
      }}
    >
      <span style={{ color: "#A8A29E" }}>you can </span>
      <span>{shown}</span>
      <span aria-hidden className="cursor-blink" style={{ marginLeft: 1 }}>
        |
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Section
// ----------------------------------------------------------------------------
export function EarthSection() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      id="earth"
      className="py-24"
      // Intentional fixed night-sky background regardless of theme.
      style={{ backgroundColor: "#0C1A0E" }}
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Tux scene */}
          <div className="order-1">
            <TuxScene reduced={prefersReducedMotion} />
          </div>

          {/* Right: text + typewriter */}
          <div className="order-2">
            <span
              style={{
                fontFamily: "var(--font-sans)",
                color: "#16A34A",
                fontSize: 11,
              }}
              className="uppercase tracking-widest"
            >
              for the next generation
            </span>

            <h2
              style={{
                fontFamily: "var(--font-sans)",
                color: "#F5F0EB",
              }}
              className="text-3xl md:text-4xl lg:text-5xl mt-3 leading-tight"
            >
              The ice remembers.
            </h2>

            <p
              style={{
                fontFamily: "var(--font-sans)",
                color: "#A8A29E",
                fontSize: 15,
              }}
              className="mt-3 leading-relaxed max-w-prose"
            >
              We build intelligent systems. We should be intelligent about what powers them.
            </p>

            <Typewriter reduced={prefersReducedMotion} />

            <p
              style={{
                fontFamily: "var(--font-sans)",
                color: "#4A6741",
                fontSize: 12,
                fontStyle: "italic",
              }}
              className="mt-12"
            >
              Tux is not just Linux&apos;s mascot.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
