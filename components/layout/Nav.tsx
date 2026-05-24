"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Monitor, Volume2, VolumeX, Music } from "lucide-react";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { useAudio, type AudioState } from "@/components/providers/AudioProvider";
import { person } from "@/lib/person";

const THEME_CYCLE: Theme[] = ["light", "dark", "system"];

const NAV_LINKS = [
  { label: "Lab",    href: "/lab"    },
  { label: "Signal", href: "/signal" },
  { label: "Stack",  href: "/stack"  },
  { label: "About",  href: "/about"  },
];

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "dark")   return <Moon size={16} />;
  if (theme === "system") return <Monitor size={16} />;
  return <Sun size={16} />;
}

function AudioIcon({ state }: { state: AudioState }) {
  if (state === "mute")    return <VolumeX size={16} />;
  if (state === "ambient") return <Music size={16} />;
  return <Volume2 size={16} />;
}

export function Nav() {
  const { theme, setTheme } = useTheme();
  const { audioState, cycleAudio, playSound } = useAudio();
  const pathname = usePathname();

  const handleThemeToggle = () => {
    playSound("toggle");
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  const handleAudioToggle = () => {
    playSound("toggle");
    cycleAudio();
  };

  const handleEarthClick = () => {
    playSound("click");
    document.getElementById("earth")?.scrollIntoView({ behavior: "smooth" });
  };

  const isHome = pathname === "/";

  return (
    <nav
      className="nav-glass sticky top-0 z-50 w-full border-b"
      style={{
        borderBottomColor: "var(--color-border)",
      }}
    >
      <div className="container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium tracking-tight"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span style={{ color: "var(--color-text-primary)" }}>{person.handle.slice(0, -1)}</span>
          <span style={{ color: "var(--color-brand)" }}>{person.handle.slice(-1)}</span>
        </Link>

        <div className="flex items-center gap-1">
          <ul className="mr-4 hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                      textDecoration: isActive ? "underline" : "none",
                      textDecorationColor: "var(--color-brand)",
                      textDecorationThickness: "2px",
                      textUnderlineOffset: "3px",
                    }}
                    className="rounded-md px-3 py-1.5 text-sm transition-colors"
                    onMouseEnter={() => playSound("hover")}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}

            {isHome && (
              <li>
                <button
                  type="button"
                  onClick={handleEarthClick}
                  onMouseEnter={() => playSound("hover")}
                  style={{
                    color: "var(--color-green, #16A34A)",
                    fontFamily: "inherit",
                  }}
                  className="rounded-md px-3 py-1.5 text-sm transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Earth
                </button>
              </li>
            )}
          </ul>

          <button
            onClick={handleThemeToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            style={{ color: "var(--color-brand)" }}
            aria-label={`Switch theme (current: ${theme})`}
          >
            <ThemeIcon theme={theme} />
          </button>

          <button
            onClick={handleAudioToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            style={{ color: "var(--color-brand)" }}
            aria-label={`Switch audio (current: ${audioState})`}
          >
            <AudioIcon state={audioState} />
          </button>
        </div>
      </div>

      <span aria-hidden className="nav-shimmer" />

      <style jsx>{`
        .nav-glass {
          background-color: rgba(250, 250, 249, 0.8);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
        }
        :global(.dark) .nav-glass {
          background-color: rgba(12, 10, 9, 0.8);
        }
        .nav-shimmer {
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(234, 88, 12, 0.10) 50%,
            transparent 100%
          );
          background-size: 50% 100%;
          background-repeat: no-repeat;
          background-position: -50% 0;
          animation: navShimmer 5s linear infinite;
          pointer-events: none;
        }
        @keyframes navShimmer {
          0%   { background-position: -50% 0; }
          60%  { background-position: 150% 0; }
          100% { background-position: 150% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nav-shimmer { animation: none; }
        }
      `}</style>
    </nav>
  );
}
