"use client";

import { useEffect, useRef } from "react";
import { introSymbols } from "@/lib/introSymbols";

interface SymbolCloudProps {
  theme: "light" | "dark";
}

// A point on the unit sphere plus its text and a per-point shell radius.
interface Node {
  x: number;
  y: number;
  z: number;
  shell: number;
  text: string;
}

// A background star. Position is stored as a fraction of the viewport so the
// field survives resizes without rebuilding. Radius/alpha are stored as 0..1
// seeds and mapped to per-theme ranges at draw time so a single field serves
// both themes (no rebuild on theme change). shade picks a per-star tint from
// the light-mode ember palette (ignored in dark, where stars are white).
interface Star {
  x: number; // 0..1 of viewport width
  y: number; // 0..1 of viewport height
  rSeed: number; // 0..1 -> per-theme radius range
  a: number; // 0..1 base-alpha seed
  tw: number; // twinkle speed
  phase: number; // twinkle phase offset
  shade: number; // 0..1 -> light-mode ember tint
}

// One arc filament of the photon accretion halo. Generated once on mount and
// stored in a ref so the layout is stable across theme changes; only
// currentAngle mutates each frame. radiusFactor is a multiple of the event
// horizon radius (resize-safe), so the absolute radius is recomputed per frame.
interface Filament {
  radiusFactor: number; // 1.05..2.2 x eventHorizonRadius
  startAngle: number; // base start angle
  sweep: number; // arc sweep, 0.4..2.2 rad (never a full circle)
  width: number; // lineWidth, 0.3..2.2 px
  alphaSeed: number; // 0..1 -> per-theme/family alpha range
  speed: number; // rad/ms (inner filaments faster: base / radiusFactor)
  colorIndex: 0 | 1 | 2; // which color family
  currentAngle: number; // mutable, advances each frame
}

// One arc of the continuous outer ring band. Many of these crowd into a tight
// outer radial band with long overlapping sweeps and a shade sampled from a
// per-theme gradient, so the band reads as one continuous sheet of bending
// light rather than discrete filaments. Layered on top of (not replacing) the
// discrete Filaments.
interface RingArc {
  radiusFactor: number; // tight outer band
  sweep: number; // long, overlapping sweeps
  width: number; // thin strokes
  alphaSeed: number; // 0..1 -> per-theme alpha range
  speed: number; // rad/ms, faster than discrete filaments
  shade: number; // 0..1 position along the per-theme shade gradient
  currentAngle: number; // mutable, advances each frame
}

type Rgb = { r: number; g: number; b: number };

// Canvas-only colors (canvas 2D cannot read CSS custom properties, so these are
// inline literals rather than --color-* tokens; the documented brand exceptions
// in EarthSection/PerspectivesSection are unrelated). Background tints sit a
// hair off the site --color-bg, which is intentional for the space backdrop.
const BG = {
  dark: "#07080f", // near-black with a faint blue tint
  light: "#f8f7f4", // warm white, near the site background
} as const;

// Discrete filament color families per theme. Dark: pale lavender-white,
// electric violet, faint cyan-blue. Light: brand orange, burnt orange, light
// brown -- warm tones that read clearly on the warm-white background (the
// earlier white strokes were near-invisible there).
const FAMILY: { dark: [Rgb, Rgb, Rgb]; light: [Rgb, Rgb, Rgb] } = {
  dark: [
    { r: 220, g: 210, b: 255 },
    { r: 160, g: 100, b: 255 },
    { r: 80, g: 180, b: 255 },
  ],
  light: [
    { r: 234, g: 88, b: 12 }, // brand orange
    { r: 201, g: 100, b: 40 }, // burnt orange
    { r: 161, g: 98, b: 54 }, // light brown
  ],
};

// Per-theme/family alpha bands. Dark cyan stays low so it reads as a subtle
// accent; light bands run a little richer so the warm strokes stay visible.
const FAMILY_ALPHA: {
  dark: [[number, number], [number, number], [number, number]];
  light: [[number, number], [number, number], [number, number]];
} = {
  dark: [
    [0.06, 0.55],
    [0.06, 0.5],
    [0.04, 0.18],
  ],
  light: [
    [0.12, 0.5],
    [0.1, 0.4],
    [0.08, 0.3],
  ],
};

// Continuous outer-ring shade gradients. A 0..1 shade samples across these
// stops, giving each arc its own tint so neighbours sit close in slightly
// different shades and shear past one another like bending light.
const RING_SHADES: { dark: Rgb[]; light: Rgb[] } = {
  dark: [
    { r: 226, g: 216, b: 255 }, // pale lavender-white
    { r: 168, g: 120, b: 255 }, // electric violet
    { r: 120, g: 120, b: 255 }, // indigo
    { r: 80, g: 178, b: 255 }, // cyan-blue
  ],
  light: [
    { r: 255, g: 224, b: 178 }, // warm cream
    { r: 251, g: 176, b: 80 }, // light orange
    { r: 234, g: 88, b: 12 }, // brand orange
    { r: 176, g: 104, b: 56 }, // light brown
  ],
};

// Per-arc alpha band for the continuous ring. Kept low because many arcs
// overlap and build up (additively in dark, by stacking in light).
const RING_ALPHA: { dark: [number, number]; light: [number, number] } = {
  dark: [0.03, 0.22],
  light: [0.06, 0.3],
};

// Cyclone/wormhole cloud opacity layers per theme. Colors come live from CSS
// custom properties (read via getComputedStyle in readStyles); only the opacity
// variants live here. Dark reads as a deep-space accretion disk (blue haze /
// brand-orange disk), light as warm amber/orange storm clouds.
const CLOUD_ALPHA = {
  dark: { haze: 0.1, band: 0.16, core: 0.22 },
  light: { haze: 0.14, band: 0.2, core: 0.3 },
} as const;

// Star color for dark. Light stars sample LIGHT_STAR_SHADES instead.
const STAR_RGB = {
  dark: "255,255,255",
} as const;

// Light-mode star palette: small orange embers instead of white pinpricks.
const LIGHT_STAR_SHADES: Rgb[] = [
  { r: 251, g: 146, b: 60 }, // light orange
  { r: 234, g: 88, b: 12 }, // brand orange
  { r: 217, g: 140, b: 90 }, // soft terracotta
  { r: 180, g: 120, b: 70 }, // light brown
];

// Muted base color per theme for the words (canvas 2D cannot read CSS vars).
// The word glow stays live-pulled from --color-brand so the word cloud itself
// (inner content) is unchanged by the accretion background.
const BASE_RGB = {
  light: "100, 100, 110",
  dark: "176, 158, 170",
} as const;

const BASE_FONT_PX = 14;
const TAU = Math.PI * 2;
const MAX_SPIN = 0.02; // per-frame spin reference used to cap trackball speed
const DRAG_GAIN = 0.0011; // pointer px/frame -> spin velocity
const GLOW_RADIUS = 150; // px around the cursor that lights words up
const ACTIVE_WINDOW_MS = 1800; // how long after the last move the field stays hot
const BASE_WHIRL = 0.0022; // gentle idle drift when the user is not steering
const HALO_BOOST = 4; // how hard mouse speed accelerates the halo spin
const STAR_COUNT_DARK = 160; // dark builds the full field
const STAR_COUNT_LIGHT = 120; // light draws the first 120 of the same field
// Halo sizing. The earlier "trim 10% by count" approach thinned the halo but
// the largest arcs (up to 2.0x the event horizon) still bled off the top and
// bottom. Instead we cap the outermost arc at MAX_HALO_FACTOR and let layout()
// shrink the sphere radius so even that outermost arc fits the viewport. Arc
// counts are restored and biased inward (see buildFilaments/buildRingArcs) so
// the ring system crowds just outside the word cloud and reads as one complete
// sphere on a fit screen, never clipped.
const MAX_HALO_FACTOR = 1.7; // outermost arc radius as a multiple of the event horizon
const FILAMENT_COUNT = 88; // discrete arc filaments in the accretion halo
const RING_COUNT = 150; // arcs in the continuous outer ring band

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Sample an Rgb at position t (0..1) across an array of color stops.
function shadeColor(stops: Rgb[], t: number): Rgb {
  const clamped = Math.min(0.999, Math.max(0, t));
  const seg = clamped * (stops.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const a = stops[i];
  const b = stops[Math.min(stops.length - 1, i + 1)];
  return { r: lerp(a.r, b.r, f), g: lerp(a.g, b.g, f), b: lerp(a.b, b.b, f) };
}

// Resolve a CSS custom property value (hex or rgb()/rgba()) to an Rgb so the
// cloud layers can be tinted straight from globals.css tokens. Falls back to
// the supplied default if the value is empty or unparseable.
function parseColor(value: string, fallback: Rgb): Rgb {
  const v = value.trim();
  if (v.startsWith("#")) {
    let hex = v.slice(1);
    if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }
  const m = v.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return fallback;
}

// Even angular distribution via the Fibonacci lattice; tight shell so the
// globe reads as a clean sphere rather than a fuzzy ball.
function buildNodes(): Node[] {
  const n = introSymbols.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes: Node[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    nodes.push({
      x: Math.cos(theta) * ring,
      y,
      z: Math.sin(theta) * ring,
      shell: 0.9 + Math.random() * 0.12,
      text: introSymbols[i],
    });
  }
  return nodes;
}

function buildStars(n: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      rSeed: Math.random(),
      a: Math.random(),
      tw: 0.4 + Math.random() * 1.6,
      phase: Math.random() * TAU,
      shade: Math.random(),
    });
  }
  return stars;
}

// Photon accretion halo. Filaments are NOT evenly distributed: roughly 55%
// cluster on the "bright side" (start angle -0.3..1.2 rad) to mimic the
// gravitational-lensing / Doppler brightness asymmetry of a real accretion
// disk. Color family is 50/30/20 across the three accents.
function buildFilaments(n: number): Filament[] {
  const filaments: Filament[] = [];
  for (let i = 0; i < n; i++) {
    const bright = Math.random() < 0.55;
    const startAngle = bright
      ? -0.3 + Math.random() * 1.5 // bright side: -0.3 .. 1.2
      : Math.random() * TAU;
    // Inner-biased (pow > 1) so most filaments hug just outside the word cloud
    // and only a few reach the MAX_HALO_FACTOR edge.
    const radiusFactor = 1.05 + Math.pow(Math.random(), 1.5) * 0.65; // 1.05 .. 1.70
    const baseSpeed = 0.00008 + Math.random() * 0.00017; // 0.00008 .. 0.00025
    const rc = Math.random();
    const colorIndex: 0 | 1 | 2 = rc < 0.5 ? 0 : rc < 0.8 ? 1 : 2;
    filaments.push({
      radiusFactor,
      startAngle,
      sweep: 0.4 + Math.random() * 1.8, // 0.4 .. 2.2
      width: 0.3 + Math.random() * 1.9, // 0.3 .. 2.2
      alphaSeed: Math.random(),
      speed: baseSpeed / radiusFactor, // inner filaments slightly faster
      colorIndex,
      currentAngle: startAngle,
    });
  }
  return filaments;
}

// Continuous outer ring band. Arcs crowd into a tight outer radial band with
// long, overlapping sweeps so they read as one rotating sheet of bending light.
// Each runs a touch faster than the discrete filaments and inner arcs of the
// band run faster than outer ones (Keplerian-ish), which makes neighbours shear
// past one another. Shade is sampled from the per-theme gradient at draw time.
function buildRingArcs(n: number): RingArc[] {
  const arcs: RingArc[] = [];
  for (let i = 0; i < n; i++) {
    const radiusFactor = 1.2 + Math.random() * 0.5; // 1.2 .. 1.70 (tight band hugging the cloud)
    const baseSpeed = 0.00016 + Math.random() * 0.00022; // faster than discrete
    arcs.push({
      radiusFactor,
      sweep: 0.9 + Math.random() * 2.6, // long, overlapping sweeps
      width: 0.4 + Math.random() * 1.1, // thin strokes
      alphaSeed: Math.random(),
      speed: baseSpeed / radiusFactor, // inner arcs of the band run faster
      shade: Math.random(),
      currentAngle: Math.random() * TAU,
    });
  }
  return arcs;
}

export function SymbolCloud({ theme }: SymbolCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const repaintRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const nodes = buildNodes();
    const order = nodes.map((_, i) => i);
    const stars = buildStars(STAR_COUNT_DARK);
    const filaments = buildFilaments(FILAMENT_COUNT);
    const ringArcs = buildRingArcs(RING_COUNT);

    // Live layout/state.
    let cssW = 0;
    let cssH = 0;
    let cx = 0;
    let cy = 0;
    let radius = 0; // word-sphere radius
    let clear = 0; // protected center zone for the logo

    let rotX = 0;
    let rotY = 0;
    let velX = 0;
    let velY = 0;
    let energy = 0; // 0..1, activity recency (word glow)
    let motion = 0; // 0..1, mouse-speed energy (halo boost)
    let cloudAngle = 0; // cyclone cloud rotation, advances with the halo
    let lastFrame = performance.now();

    let pointerX = 0;
    let pointerY = 0;
    let pointerInit = false;
    let lastMoveAt = -Infinity;
    let dragVX = 0; // pointer velocity (px/event), drives the trackball
    let dragVY = 0;

    let mono = "'JetBrains Mono', monospace";
    let brand = "#EA580C";
    // Cloud layer tints, pulled live from globals.css tokens.
    let brandRgb: Rgb = { r: 234, g: 88, b: 12 };
    let blueRgb: Rgb = { r: 37, g: 99, b: 235 };
    let amberRgb: Rgb = { r: 217, g: 119, b: 6 };

    const readStyles = () => {
      const cs = getComputedStyle(canvas);
      mono =
        cs.getPropertyValue("--font-mono").trim() ||
        "'JetBrains Mono', monospace";
      brand = cs.getPropertyValue("--color-brand").trim() || "#EA580C";
      brandRgb = parseColor(cs.getPropertyValue("--color-brand"), brandRgb);
      blueRgb = parseColor(cs.getPropertyValue("--color-blue"), blueRgb);
      amberRgb = parseColor(cs.getPropertyValue("--color-amber"), amberRgb);
    };

    const layout = () => {
      const dpr = window.devicePixelRatio || 1;
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = cssW / 2;
      cy = cssH / 2;
      const minDim = Math.min(cssW, cssH);
      // Cap the sphere radius so the outermost arc (radius * 1.02 *
      // MAX_HALO_FACTOR) stays within half the shorter viewport dimension, with
      // a small margin. This keeps the whole ring system on-screen instead of
      // clipping the largest circles off the top and bottom.
      const fitRadius = ((minDim / 2) * 0.94) / (1.02 * MAX_HALO_FACTOR);
      radius = Math.max(150, Math.min(minDim * 0.33, 380, fitRadius));
      clear = Math.max(135, radius * 0.42);
    };

    // Event horizon sits just outside the word cloud circle. The accretion
    // halo lives entirely beyond this radius; nothing fills the interior, so
    // the word cloud area shows only the plain space background.
    const eventHorizon = () => radius * 1.02;

    // --- Background star field. --------------------------------------------
    const drawStarfield = (isDark: boolean) => {
      const t = performance.now() * 0.001;
      const count = isDark ? STAR_COUNT_DARK : STAR_COUNT_LIGHT;
      for (let i = 0; i < count; i++) {
        const s = stars[i];
        const x = s.x * cssW;
        const y = s.y * cssH;
        // Dark twinkles openly; light is gentler.
        const tw = isDark
          ? 0.6 + 0.4 * Math.sin(t * s.tw + s.phase)
          : 0.7 + 0.3 * Math.sin(t * s.tw + s.phase);
        const r = isDark
          ? lerp(0.4, 1.4, s.rSeed)
          : lerp(0.4, 1.3, s.rSeed);
        let color: string;
        let alpha: number;
        if (isDark) {
          color = `rgb(${STAR_RGB.dark})`;
          alpha = lerp(0.3, 0.8, s.a) * tw;
        } else {
          // Small warm embers, kept low so the field reads as a faint dusting
          // of orange rather than a busy sky.
          const c = shadeColor(LIGHT_STAR_SHADES, s.shade);
          color = `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
          alpha = lerp(0.14, 0.4, s.a) * tw;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    // --- Photon accretion halo: discrete arc filaments. --------------------
    // No geometric ring, no circle stroke, no straight rays. Each filament is a
    // partial arc at a randomized radius/angle/width/alpha, rotating at its own
    // speed. Dark blends additively for a luminous look; light paints normally.
    const drawFilaments = (isDark: boolean) => {
      const ehR = eventHorizon();
      const fam = isDark ? FAMILY.dark : FAMILY.light;
      const famA = isDark ? FAMILY_ALPHA.dark : FAMILY_ALPHA.light;
      ctx.save();
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";
      ctx.lineCap = "round";
      for (const f of filaments) {
        const col = fam[f.colorIndex];
        const [amin, amax] = famA[f.colorIndex];
        const alpha = lerp(amin, amax, f.alphaSeed);
        const rr = ehR * f.radiusFactor;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, f.currentAngle, f.currentAngle + f.sweep);
        ctx.lineWidth = f.width;
        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
        ctx.stroke();
      }
      ctx.restore();
    };

    // --- Continuous outer ring band. ---------------------------------------
    // Many thin arcs crowded into a tight outer band, each a slightly different
    // shade, with long overlapping sweeps and per-arc speeds. Together they read
    // as one continuous sheet of light bending and rotating around the cloud.
    const drawRingBand = (isDark: boolean) => {
      const ehR = eventHorizon();
      const stops = isDark ? RING_SHADES.dark : RING_SHADES.light;
      const [amin, amax] = isDark ? RING_ALPHA.dark : RING_ALPHA.light;
      ctx.save();
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";
      ctx.lineCap = "round";
      for (const a of ringArcs) {
        const col = shadeColor(stops, a.shade);
        const alpha = lerp(amin, amax, a.alphaSeed);
        const rr = ehR * a.radiusFactor;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, a.currentAngle, a.currentAngle + a.sweep);
        ctx.lineWidth = a.width;
        ctx.strokeStyle = `rgba(${Math.round(col.r)},${Math.round(col.g)},${Math.round(col.b)},${alpha})`;
        ctx.stroke();
      }
      ctx.restore();
    };

    // --- Cyclone / wormhole cloud shading (behind the rings). --------------
    // Three layered radial gradients with distinct opacities -- outer haze,
    // mid band, inner glow -- give the halo a whirling cloud body like a
    // cyclone eye or accretion disk. Every layer is annular (transparent at the
    // center) so the eye stays clear and never washes out the word cloud. The
    // haze and band centers are offset along opposing rotating vectors driven
    // by cloudAngle, so the dense side sweeps around as the cloud whirls.
    const cloudLayer = (
      ox: number,
      oy: number,
      r0: number,
      r1: number,
      peak: number,
      col: Rgb,
      a: number,
    ) => {
      const clear0 = `rgba(${col.r},${col.g},${col.b},0)`;
      const g = ctx.createRadialGradient(ox, oy, r0, ox, oy, r1);
      g.addColorStop(0, clear0);
      g.addColorStop(peak, `rgba(${col.r},${col.g},${col.b},${a})`);
      g.addColorStop(1, clear0);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cssW, cssH);
    };

    const drawCloud = (isDark: boolean) => {
      const ehR = eventHorizon();
      const al = isDark ? CLOUD_ALPHA.dark : CLOUD_ALPHA.light;
      // Dark: blue haze around a brand-orange disk (deep-space accretion).
      // Light: brand-orange storm body with an amber band.
      const hazeCol = isDark ? blueRgb : brandRgb;
      const bandCol = isDark ? brandRgb : amberRgb;
      const coreCol = isDark ? blueRgb : brandRgb;
      const off = ehR * 0.45;
      ctx.save();
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";

      // Outer haze: broad and faint, drifting one way.
      cloudLayer(
        cx + Math.cos(cloudAngle) * off * 0.6,
        cy + Math.sin(cloudAngle) * off * 0.6,
        ehR * 1.15,
        ehR * 2.8,
        0.45,
        hazeCol,
        al.haze,
      );
      // Mid band: the whirling cloud wall, offset the opposite way so the
      // bright side rotates around the eye.
      cloudLayer(
        cx + Math.cos(cloudAngle + Math.PI) * off,
        cy + Math.sin(cloudAngle + Math.PI) * off,
        ehR * 1.0,
        ehR * 2.2,
        0.4,
        bandCol,
        al.band,
      );
      // Inner glow: bright eye-wall just outside the event horizon.
      cloudLayer(cx, cy, ehR, ehR * 1.8, 0.18, coreCol, al.core);
      ctx.restore();
    };

    // --- The word sphere (inner content -- unchanged). ---------------------
    const drawWords = () => {
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const base = BASE_RGB[themeRef.current];

      const px = new Float64Array(nodes.length);
      const py = new Float64Array(nodes.length);
      const depth = new Float64Array(nodes.length);

      for (let i = 0; i < nodes.length; i++) {
        const nd = nodes[i];
        const x1 = nd.x * cosY + nd.z * sinY;
        const z1 = -nd.x * sinY + nd.z * cosY;
        const y2 = nd.y * cosX - z1 * sinX;
        const z2 = nd.y * sinX + z1 * cosX;
        const r = radius * nd.shell;
        px[i] = cx + x1 * r;
        py[i] = cy + y2 * r;
        depth[i] = (z2 + 1) / 2;
      }

      order.sort((a, b) => depth[a] - depth[b]);

      const hot = energy > 0.02;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let k = 0; k < order.length; k++) {
        const i = order[k];
        const d = depth[i];
        const sx = px[i];
        const sy = py[i];

        const distCenter = Math.hypot(sx - cx, sy - cy);
        const centerFade = smoothstep(clear, clear + 60, distCenter);
        if (centerFade <= 0.001) continue;
        const edgeFade =
          1 - smoothstep(radius * 0.94, radius * 1.06, distCenter) * 0.85;

        const alpha = (0.4 + d * 0.55) * centerFade * edgeFade;
        const fontSize = BASE_FONT_PX * (0.72 + d * 0.6);

        let glow = 0;
        if (hot) {
          const dm = Math.hypot(sx - pointerX, sy - pointerY);
          if (dm < GLOW_RADIUS) glow = (1 - dm / GLOW_RADIUS) * energy;
        }

        ctx.font = `${fontSize.toFixed(1)}px ${mono}`;

        if (glow > 0.04) {
          ctx.globalAlpha = Math.min(1, alpha + glow * 0.5);
          ctx.shadowColor = brand;
          ctx.shadowBlur = 6 + glow * 18;
          ctx.fillStyle = brand;
        } else {
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgb(${base})`;
        }

        ctx.fillText(nodes[i].text, sx, sy);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const draw = () => {
      const isDark = themeRef.current === "dark";
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = isDark ? BG.dark : BG.light;
      ctx.fillRect(0, 0, cssW, cssH);
      drawStarfield(isDark);
      drawCloud(isDark);
      drawFilaments(isDark);
      drawRingBand(isDark);
      drawWords();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    };

    repaintRef.current = () => {
      readStyles();
      draw();
    };

    let raf = 0;
    const tick = () => {
      // Re-measure if the box changed since last frame (ResizeObserver lag).
      if (canvas.clientWidth !== cssW || canvas.clientHeight !== cssH) layout();

      const now = performance.now();
      const dt = Math.min(50, now - lastFrame); // clamp tab-blur catch-up jumps
      lastFrame = now;

      const active = now - lastMoveAt < ACTIVE_WINDOW_MS;
      energy += ((active ? 1 : 0) - energy) * 0.05;
      motion *= 0.94; // mouse-speed energy decays each frame

      // Advance the halo. A static cursor leaves it at base speed; an abrupt
      // move spikes `motion` toward 1, so the whole halo briefly whirls fast
      // and then eases back as `motion` decays.
      const haloBoost = 1 + motion * HALO_BOOST;
      for (const f of filaments) {
        f.currentAngle += f.speed * dt * haloBoost;
      }
      for (const a of ringArcs) {
        a.currentAngle += a.speed * dt * haloBoost;
      }
      cloudAngle += 0.00012 * dt * haloBoost; // cyclone whirl, same boost

      // Trackball: the direction the cursor moves drives the spin, so the
      // visitor feels in control. Velocity decays so a flick eases out.
      dragVX *= 0.86;
      dragVY *= 0.86;
      const dragging = Math.hypot(dragVX, dragVY) > 0.12;
      let targetVelY = dragVX * DRAG_GAIN; // horizontal drag -> spin
      let targetVelX = -dragVY * DRAG_GAIN; // vertical drag -> tilt
      if (!dragging) targetVelY += BASE_WHIRL; // always-alive idle drift
      const cap = MAX_SPIN * 5;
      targetVelY = Math.max(-cap, Math.min(cap, targetVelY));
      targetVelX = Math.max(-cap, Math.min(cap, targetVelX));
      velX += (targetVelX - velX) * 0.12;
      velY += (targetVelY - velY) * 0.12;
      rotX += velX;
      rotY += velY;

      draw();
      raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - pointerX;
      const dy = e.clientY - pointerY;
      const dist = pointerInit ? Math.hypot(dx, dy) : 0;
      if (pointerInit) {
        dragVX = dx;
        dragVY = dy;
      }
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerInit = true;
      lastMoveAt = performance.now();
      // Faster movement injects more motion energy (capped) -> faster halo.
      // Sensitivity raised 2.5x (0.006 -> 0.015) so rapid moves whirl harder.
      motion = Math.min(1, motion + dist * 0.015);
    };

    readStyles();
    layout();

    if (reduced) {
      // Single static frame: a slightly tilted globe over a still accretion
      // halo (arcs held at their current angles).
      rotX = -0.35;
      rotY = 0.6;
      draw();
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      raf = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(() => {
      layout();
      if (reduced) draw();
    });
    ro.observe(canvas);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          readStyles();
          if (reduced) draw();
        })
        .catch(() => {});
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    repaintRef.current();
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
