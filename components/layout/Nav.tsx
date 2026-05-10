"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Monitor, Volume2, VolumeX, Music } from "lucide-react";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { useAudio, type AudioState } from "@/components/providers/AudioProvider";
import { person } from "@/lib/person";

const THEME_CYCLE: Theme[] = ["light", "dark", "system"];

const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "Stack", href: "/stack" },
  { label: "About", href: "/about" },
];

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "dark") return <Moon size={16} />;
  if (theme === "system") return <Monitor size={16} />;
  return <Sun size={16} />;
}

function AudioIcon({ state }: { state: AudioState }) {
  if (state === "mute") return <VolumeX size={16} />;
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

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
        borderBottomColor: "var(--color-border)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-medium tracking-tight"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}
        >
          {person.handle}
          <span style={{ color: "var(--color-brand)" }}>.</span>
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
    </nav>
  );
}
