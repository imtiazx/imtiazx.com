"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { person } from "@/lib/person";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 pixel = gl_FragCoord.xy;
  float t = u_time;

  vec2 p1 = vec2(
    u_resolution.x * (0.25 + 0.25 * sin(t * 0.0003)),
    u_resolution.y * (0.35 + 0.20 * cos(t * 0.0004))
  );
  float a1 = smoothstep(600.0, 0.0, distance(pixel, p1)) * 0.15;
  vec3 c1 = vec3(234.0, 88.0, 12.0) / 255.0;

  vec2 p2 = vec2(
    u_resolution.x * (0.75 + 0.20 * cos(t * 0.0005 + 1.7)),
    u_resolution.y * (0.55 + 0.20 * sin(t * 0.0006 + 2.3))
  );
  float a2 = smoothstep(500.0, 0.0, distance(pixel, p2)) * 0.08;
  vec3 c2 = vec3(13.0, 148.0, 136.0) / 255.0;

  vec2 p3 = vec2(
    u_resolution.x * (0.55 + 0.30 * sin(t * 0.0008 + 4.1)),
    u_resolution.y * (0.70 + 0.15 * cos(t * 0.0007 + 3.5))
  );
  float a3 = smoothstep(450.0, 0.0, distance(pixel, p3)) * 0.06;
  vec3 c3 = vec3(234.0, 88.0, 12.0) / 255.0;

  vec3 color = c1 * a1 + c2 * a2 + c3 * a3;
  float alpha = a1 + a2 + a3;

  gl_FragColor = vec4(color, alpha);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function GradientCanvas({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    const start = performance.now();
    let visible = true;

    const render = (timeMs: number) => {
      gl.uniform1f(timeLoc, timeMs - start);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const loop = () => {
      if (visible && !paused) {
        render(performance.now());
      }
      rafId = requestAnimationFrame(loop);
    };

    render(performance.now());
    if (!paused) {
      rafId = requestAnimationFrame(loop);
    }

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [paused]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

function MagneticButton({
  href,
  variant,
  children,
  reduced,
}: {
  href: string;
  variant: "primary" | "ghost";
  children: React.ReactNode;
  reduced: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.3, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.3, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 80 + Math.max(rect.width, rect.height) / 2) {
        xTo(dx * 0.3);
        yTo(dy * 0.3);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    borderRadius: 8,
    padding: "12px 22px",
    fontSize: 14,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "filter 250ms ease, box-shadow 250ms ease, transform 250ms ease",
    willChange: "transform",
  };

  const primary: React.CSSProperties = {
    ...baseStyle,
    background: "var(--color-brand)",
    color: "#FFFFFF",
    boxShadow: "0 2px 12px rgba(234, 88, 12, 0.20)",
  };

  const ghost: React.CSSProperties = {
    ...baseStyle,
    background: "transparent",
    color: "var(--color-brand)",
    border: "1px solid var(--color-brand)",
  };

  return (
    <Link
      ref={ref}
      href={href}
      className="hero-magnetic"
      style={variant === "primary" ? primary : ghost}
    >
      {children}
    </Link>
  );
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = headingRef.current;
    if (!el) return;

    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = new SplitText(el, { type: "words" });
      gsap.set(split.words, { opacity: 0, y: 30, filter: "blur(8px)" });
      gsap.to(split.words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.4,
      });
    }, el);

    return () => {
      split?.revert();
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      className="relative flex items-center min-h-screen overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      <GradientCanvas paused={prefersReducedMotion} />

      <div className="container relative py-24" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto md:mx-0 text-center md:text-left">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-brand)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 24,
            }}
          >
            AI Engineer -- Generative Systems
          </motion.div>

          <h1
            ref={headingRef}
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-text-primary)",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              lineHeight: 1.1,
              marginBottom: 28,
              opacity: prefersReducedMotion ? 1 : undefined,
            }}
          >
            {person.tagline}
          </h1>

          <motion.p
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.9 }}
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-secondary)",
              fontSize: "clamp(1rem, 2vw, 1.125rem)",
              lineHeight: 1.65,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: 36,
            }}
            className="md:mx-0"
          >
            {person.bio}
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 1.1 }}
            className="hidden md:flex items-center gap-6 mb-10"
            aria-hidden
          >
            {person.metrics.map((m, i) => (
              <div key={m.label} className="flex items-center gap-6">
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "var(--color-brand)",
                      fontSize: 28,
                      lineHeight: 1,
                    }}
                  >
                    {m.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-text-muted)",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {m.label}
                  </div>
                </div>
                {i < person.metrics.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      height: 32,
                      background: "var(--color-border)",
                    }}
                  />
                )}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 1.3 }}
            className="flex flex-wrap gap-4 justify-center md:justify-start"
          >
            <MagneticButton href="/lab" variant="primary" reduced={prefersReducedMotion}>
              View the Lab
            </MagneticButton>
            <MagneticButton href="/signal" variant="ghost" reduced={prefersReducedMotion}>
              Read Signal
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          color: "var(--color-text-muted)",
          opacity: scrolled ? 0 : 1,
          transition: "opacity 400ms ease",
          zIndex: 1,
          pointerEvents: "none",
        }}
        className="hero-scroll-indicator"
      >
        <ChevronDown size={20} />
      </div>

      <style jsx>{`
        @keyframes heroBounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50%      { transform: translateY(6px); opacity: 1; }
        }
        .hero-scroll-indicator :global(svg) {
          animation: heroBounce 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-scroll-indicator :global(svg) { animation: none; }
        }
        .hero-magnetic:hover {
          filter: brightness(1.08);
        }
      `}</style>
    </section>
  );
}

