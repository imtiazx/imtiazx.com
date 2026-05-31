"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link2 } from "lucide-react";
import { useInView } from "@/lib/useInView";

export interface OrbitalItem {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  relatedIds: number[];
}

interface RadialOrbitalTimelineProps {
  items: OrbitalItem[];
}

/**
 * Themed radial orbital timeline. Roles rotate around a central terminal-mark
 * seal that mirrors the landing page logo. Clicking a node pauses rotation,
 * scales the node, glows the title text (no boxed badge), and reveals a card
 * with description and connected roles. Colors come from CSS tokens so the
 * component respects light/dark themes; reduced motion disables auto-rotation
 * and pulse loops via the global media-query override in globals.css.
 */
export default function RadialOrbitalTimeline({ items }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  // Index of the orbital node currently glowing in sync with the seal. Advances
  // on every full cycle of the seal's CSS pulse so the rhythm stays in lockstep
  // with the visual the user already sees beating in the center.
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const [containerRef, inView] = useInView<HTMLDivElement>({ rootMargin: "200px" });
  const orbitRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = items.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const centerViewOnNode = (nodeId: number) => {
    if (!nodeRefs.current[nodeId]) return;
    const nodeIndex = items.findIndex((item) => item.id === nodeId);
    const totalNodes = items.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState: Record<number, boolean> = {};
      const wasOpen = prev[id];
      if (!wasOpen) newState[id] = true;
      return newState;
    });

    const wasOpen = expandedItems[id];
    if (!wasOpen) {
      setActiveNodeId(id);
      setAutoRotate(false);
      const relatedItems = getRelatedItems(id);
      const newPulseEffect: Record<number, boolean> = {};
      relatedItems.forEach((relId) => {
        newPulseEffect[relId] = true;
      });
      setPulseEffect(newPulseEffect);
      centerViewOnNode(id);
    } else {
      setActiveNodeId(null);
      setAutoRotate(true);
      setPulseEffect({});
    }
  };

  useEffect(() => {
    if (!autoRotate || !inView) return;
    const rotationTimer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(rotationTimer);
  }, [autoRotate, inView]);

  // Advance the spotlight on every full cycle of the seal's CSS pulse. Using
  // animationiteration keeps the node glow and the seal glow phase-locked even
  // if React's render cadence drifts. Pauses when a node is expanded or when
  // the section scrolls offscreen.
  useEffect(() => {
    if (!autoRotate || activeNodeId !== null || !inView) return;
    const el = sealRef.current;
    if (!el) return;
    const onIter = () => {
      setSpotlightIdx((i) => (i + 1) % items.length);
    };
    el.addEventListener("animationiteration", onIter);
    return () => el.removeEventListener("animationiteration", onIter);
  }, [autoRotate, activeNodeId, items.length, inView]);

  // Responsive orbit radius: smaller on mobile so labels stay readable.
  const [radius, setRadius] = useState(260);
  useEffect(() => {
    const update = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      if (w < 480) setRadius(150);
      else if (w < 768) setRadius(200);
      else if (w < 1280) setRadius(240);
      else setRadius(280);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, angle, zIndex, opacity };
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        height: "min(820px, 92vh)",
        minHeight: 620,
        backgroundColor: "transparent",
      }}
    >
      <div
        ref={orbitRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {/* Center terminal-mark seal (matches landing page intro logo). The
            seal is intentionally larger than nodes so it reads as the source
            the orbits emanate from, not just another waypoint. */}
        <div ref={sealRef} className="orbital-seal" aria-hidden>
          <div className="orbital-seal-inner">
            <svg viewBox="0 0 44 44" width="40" height="40" fill="none" aria-hidden>
              <polyline
                points="14,12 28,20 14,28"
                stroke="var(--color-brand)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="14"
                y1="34"
                x2="32"
                y2="34"
                stroke="var(--color-brand)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Orbit ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: radius * 2,
            height: radius * 2,
            border: "1px dashed color-mix(in srgb, var(--color-brand) 22%, transparent)",
          }}
        />

        {items.map((item, index) => {
          const position = calculateNodePosition(index, items.length);
          const isExpanded = !!expandedItems[item.id];
          const isRelated = isRelatedToActive(item.id);
          const isPulsing = !!pulseEffect[item.id];
          const isSpotlight =
            autoRotate && activeNodeId === null && spotlightIdx === index;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              ref={(el) => {
                nodeRefs.current[item.id] = el;
              }}
              className={`absolute cursor-pointer ${
                isSpotlight ? "orbital-spotlight" : ""
              }`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                zIndex: isExpanded ? 200 : position.zIndex,
                opacity: isExpanded ? 1 : position.opacity,
                transition: "opacity 700ms ease, transform 700ms ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
            >
              {/* Radial glow halo */}
              <div
                className={`orbital-halo absolute rounded-full pointer-events-none ${
                  isPulsing ? "orbital-pulse" : ""
                }`}
                style={{
                  width: 56,
                  height: 56,
                  left: -8,
                  top: -8,
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--color-brand) 22%, transparent) 0%, transparent 70%)",
                }}
              />

              {/* Node circle */}
              <div
                className="orbital-node"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderStyle: "solid",
                  transition: "all 300ms ease, transform 300ms ease",
                  backgroundColor: isExpanded
                    ? "var(--color-brand)"
                    : isRelated
                    ? "color-mix(in srgb, var(--color-brand) 35%, var(--color-surface))"
                    : "var(--color-surface)",
                  borderColor: isExpanded
                    ? "var(--color-brand)"
                    : isRelated
                    ? "var(--color-brand)"
                    : "color-mix(in srgb, var(--color-brand) 45%, transparent)",
                  color: isExpanded
                    ? "#FFFFFF"
                    : isRelated
                    ? "var(--color-brand)"
                    : "var(--color-text-secondary)",
                  boxShadow: isExpanded
                    ? "0 0 18px 4px color-mix(in srgb, var(--color-brand) 45%, transparent)"
                    : "none",
                  transform: isExpanded ? "scale(1.4)" : "scale(1)",
                }}
              >
                <Icon size={16} />
              </div>

              {/* Title label below node. Glow lives on the text itself, no
                  background pill or rectangle. */}
              <div
                className="orbital-label"
                style={{
                  position: "absolute",
                  top: 52,
                  left: "50%",
                  transform: `translateX(-50%) ${isExpanded ? "scale(1.15)" : "scale(1)"}`,
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: isExpanded
                    ? "var(--color-brand)"
                    : isRelated
                    ? "var(--color-brand)"
                    : "var(--color-text-muted)",
                  textShadow: isExpanded
                    ? "0 0 12px color-mix(in srgb, var(--color-brand) 70%, transparent), 0 0 22px color-mix(in srgb, var(--color-brand) 35%, transparent)"
                    : "none",
                  transition: "all 300ms ease",
                  pointerEvents: "none",
                }}
              >
                {item.title}
              </div>

              {/* Expanded detail card. Bottom-half nodes pop the card upward so
                  it never overflows the container. */}
              {isExpanded && (() => {
                const openUp = position.y > 30;
                return (
                <div
                  className="orbital-card"
                  style={{
                    position: "absolute",
                    ...(openUp
                      ? { bottom: 96, top: "auto" }
                      : { top: 96, bottom: "auto" }),
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 280,
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid color-mix(in srgb, var(--color-brand) 35%, var(--color-border))",
                    borderRadius: 12,
                    padding: 18,
                    boxShadow:
                      "0 10px 40px color-mix(in srgb, var(--color-brand) 18%, transparent), 0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Connector line from node to card */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      ...(openUp ? { bottom: -10 } : { top: -10 }),
                      left: "50%",
                      width: 1,
                      height: 10,
                      backgroundColor:
                        "color-mix(in srgb, var(--color-brand) 60%, transparent)",
                      transform: "translateX(-50%)",
                    }}
                  />

                  {/* Title: glowing brand text, NOT inside a rectangle/pill */}
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      fontSize: 18,
                      lineHeight: 1.2,
                      color: "var(--color-brand)",
                      textShadow:
                        "0 0 14px color-mix(in srgb, var(--color-brand) 55%, transparent), 0 0 28px color-mix(in srgb, var(--color-brand) 30%, transparent)",
                      margin: 0,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-text-secondary)",
                      fontSize: 13,
                      lineHeight: 1.55,
                      marginTop: 10,
                    }}
                  >
                    {item.description}
                  </p>

                  {item.relatedIds.length > 0 && (
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 12,
                        borderTop: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                          color: "var(--color-text-muted)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                        }}
                      >
                        <Link2 size={10} style={{ marginRight: 6 }} />
                        Connected
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {item.relatedIds.map((relatedId) => {
                          const relatedItem = items.find((i) => i.id === relatedId);
                          if (!relatedItem) return null;
                          return (
                            <button
                              key={relatedId}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItem(relatedId);
                              }}
                              className="orbital-chip"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                height: 24,
                                padding: "0 8px",
                                borderRadius: 4,
                                border: "1px solid var(--color-border)",
                                backgroundColor: "transparent",
                                color: "var(--color-text-secondary)",
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                letterSpacing: "0.04em",
                                cursor: "pointer",
                                transition: "all 200ms ease",
                              }}
                            >
                              {relatedItem.title}
                              <ArrowRight size={10} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );})()}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .orbital-seal {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 9999px;
          border: 1.5px solid color-mix(in srgb, var(--color-brand) 35%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          animation: orbitalSealPulse 3s ease-in-out infinite;
        }
        .orbital-seal-inner {
          width: 102px;
          height: 102px;
          border-radius: 9999px;
          background-color: color-mix(in srgb, var(--color-bg) 92%, transparent);
          border: 0.5px solid color-mix(in srgb, var(--color-brand) 18%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .orbital-pulse {
          animation: orbitalHaloPulse 1.6s ease-in-out infinite;
        }
        /* One-shot 3s pulse, applied while a node holds the spotlight. The
           duration matches orbitalSealPulse so node + seal peak together; the
           next node's animation begins as the seal's next iteration starts. */
        .orbital-spotlight .orbital-node {
          animation: orbitalNodeBlink 3s ease-in-out;
        }
        .orbital-spotlight .orbital-halo {
          animation: orbitalHaloBlink 3s ease-in-out;
        }
        .orbital-spotlight .orbital-label {
          animation: orbitalLabelBlink 3s ease-in-out;
        }
        @keyframes orbitalNodeBlink {
          0%,
          100% {
            box-shadow: 0 0 0 0 transparent;
            border-color: color-mix(in srgb, var(--color-brand) 45%, transparent);
            color: var(--color-text-secondary);
          }
          50% {
            box-shadow: 0 0 22px 6px
              color-mix(in srgb, var(--color-brand) 50%, transparent);
            border-color: var(--color-brand);
            color: var(--color-brand);
          }
        }
        @keyframes orbitalHaloBlink {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }
        @keyframes orbitalLabelBlink {
          0%,
          100% {
            color: var(--color-text-muted);
            text-shadow: none;
          }
          50% {
            color: var(--color-brand);
            text-shadow: 0 0 10px
              color-mix(in srgb, var(--color-brand) 55%, transparent);
          }
        }
        .orbital-chip:hover {
          border-color: var(--color-brand) !important;
          color: var(--color-brand) !important;
          background-color: color-mix(
            in srgb,
            var(--color-brand) 8%,
            transparent
          ) !important;
        }
        @keyframes orbitalSealPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-brand) 0%, transparent);
            border-color: color-mix(in srgb, var(--color-brand) 35%, transparent);
          }
          50% {
            box-shadow: 0 0 28px 8px color-mix(in srgb, var(--color-brand) 30%, transparent);
            border-color: color-mix(in srgb, var(--color-brand) 75%, transparent);
          }
        }
        @keyframes orbitalHaloPulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
