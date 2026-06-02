"use client";

import { Music, VolumeX, Volume1 } from "lucide-react";
import { useSound, type SoundMode } from "@/components/providers/SoundProvider";

const LABEL: Record<SoundMode, string> = {
  muted: "muted",
  click: "click sounds",
  full: "click + music",
};

// Keep every state inside the audio-icon family so the button itself reads as
// a sound control at a glance, regardless of which mode is active.
//   muted -> speaker with X     (off)
//   click -> speaker, low bars  (minimal audio)
//   full  -> music note         (music playing)
function ModeIcon({ mode }: { mode: SoundMode }) {
  if (mode === "muted") return <VolumeX size={16} />;
  if (mode === "click") return <Volume1 size={16} />;
  return <Music size={16} />;
}

interface Props {
  variant?: "nav" | "intro";
  onClick?: (e: React.MouseEvent) => void;
}

export function SoundToggle({ variant = "nav", onClick }: Props) {
  const { mode, cycleMode } = useSound();

  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    cycleMode();
  };

  if (variant === "intro") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Sound: ${LABEL[mode]} (click to cycle)`}
        className="intro-sound-toggle"
        style={{
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
        <ModeIcon mode={mode} />
        <style jsx>{`
          .intro-sound-toggle:hover {
            background-color: color-mix(in srgb, var(--color-brand) 12%, transparent);
          }
        `}</style>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Sound: ${LABEL[mode]} (click to cycle)`}
      className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
      style={{ color: "var(--color-brand)" }}
    >
      <ModeIcon mode={mode} />
    </button>
  );
}
