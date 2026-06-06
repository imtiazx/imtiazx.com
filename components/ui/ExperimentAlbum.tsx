"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import type {
  ExperimentAlbum as Album,
  ExperimentPiece,
} from "@/lib/experiments";
import { useSound } from "@/components/providers/SoundProvider";

interface ExperimentAlbumProps {
  album: Album;
}

export function ExperimentAlbum({ album }: ExperimentAlbumProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        borderRadius: 16,
      }}
      className="border p-6 md:p-10"
    >
      <header className="mb-8 md:mb-10">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
          className="text-3xl md:text-4xl"
        >
          {album.title}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-muted)",
          }}
          className="mt-2 text-sm md:text-base max-w-2xl"
        >
          {album.subtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 lg:auto-rows-fr">
        {album.pieces.map((piece) => (
          <PieceTile
            key={piece.id}
            piece={piece}
            prefersReducedMotion={!!prefersReducedMotion}
          />
        ))}
      </div>
    </section>
  );
}

function PieceTile({
  piece,
  prefersReducedMotion,
}: {
  piece: ExperimentPiece;
  prefersReducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isVideo = piece.media.kind === "video";

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={prefersReducedMotion ? {} : { y: -3 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        borderColor: hovered ? "var(--color-brand)" : "var(--color-border)",
        boxShadow: hovered ? "0 12px 30px var(--color-brand-light)" : "none",
        backgroundColor: "var(--color-surface-alt)",
        borderRadius: 14,
      }}
      className={
        "border p-4 md:p-5 h-full transition-[border-color,box-shadow] duration-200 flex " +
        // Reel sits beside its meta; still stacks meta below the wide image.
        (isVideo ? "flex-row gap-5" : "flex-col gap-4")
      }
    >
      {isVideo ? (
        <ReelMedia piece={piece} prefersReducedMotion={prefersReducedMotion} />
      ) : (
        <StillMedia piece={piece} />
      )}
      <Meta piece={piece} />
    </motion.article>
  );
}

function StillMedia({ piece }: { piece: ExperimentPiece }) {
  return (
    <div
      style={{
        borderColor: "var(--color-border)",
        borderRadius: 10,
        backgroundColor: "var(--color-bg)",
      }}
      className="border overflow-hidden w-full"
    >
      <Image
        src={piece.media.src}
        alt={piece.media.alt}
        width={piece.media.width}
        height={piece.media.height}
        sizes="(min-width: 1024px) 40vw, 90vw"
        className="block w-full h-auto"
        priority={false}
      />
    </div>
  );
}

function ReelMedia({
  piece,
  prefersReducedMotion,
}: {
  piece: ExperimentPiece;
  prefersReducedMotion: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { duckMusic } = useSound();

  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // While the reel owns the audio channel, hold the release fn returned by
  // duckMusic. Releasing it lets the ambient music resume.
  const releaseAudioRef = useRef<(() => void) | null>(null);

  // Autoplay-on-view. Pauses when scrolled off screen; resumes when back.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (prefersReducedMotion) {
      v.pause();
      setPlaying(false);
      return;
    }
    if (inView && v.paused) {
      void v.play().then(() => setPlaying(true)).catch(() => {});
    } else if (!inView && !v.paused) {
      v.pause();
      setPlaying(false);
    }
  }, [inView, prefersReducedMotion]);

  // Release the duck on unmount so the music isn't stranded paused if the
  // user navigates away mid-listen.
  useEffect(() => {
    return () => {
      releaseAudioRef.current?.();
      releaseAudioRef.current = null;
    };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  // Track fullscreen state so the button can swap between enter / exit icons,
  // including when the user exits via the Esc key (no click event fires).
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void el.requestFullscreen().catch(() => {});
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const nextMuted = !v.muted;
    v.muted = nextMuted;
    setMuted(nextMuted);

    if (nextMuted) {
      releaseAudioRef.current?.();
      releaseAudioRef.current = null;
    } else {
      // Unmuting requires a user gesture (this click) -- duck the ambient
      // music and ensure the video is actually playing audibly.
      if (!releaseAudioRef.current) releaseAudioRef.current = duckMusic();
      if (v.paused) void v.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [duckMusic]);

  return (
    <div
      ref={containerRef}
      style={{
        borderColor: isFullscreen ? "transparent" : "var(--color-border)",
        borderRadius: isFullscreen ? 0 : 10,
        backgroundColor: "#000",
        aspectRatio: isFullscreen
          ? undefined
          : `${piece.media.width} / ${piece.media.height}`,
      }}
      className={
        "relative border overflow-hidden flex-shrink-0 group " +
        (isFullscreen
          ? "w-screen h-screen"
          : "w-[200px] sm:w-[220px] md:w-[240px]")
      }
    >
      <video
        ref={videoRef}
        src={piece.media.src}
        poster={piece.media.poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={piece.media.alt}
        onClick={togglePlay}
        className={
          "block w-full h-full cursor-pointer " +
          (isFullscreen ? "object-contain" : "object-cover")
        }
      />

      <div
        className={
          "absolute left-0 right-0 bottom-0 px-3 pb-3 pt-8 flex items-center gap-2 pointer-events-none transition-opacity duration-200 " +
          // Always visible in fullscreen (otherwise the user can't exit
          // without hitting Esc); hover-revealed at normal size.
          (isFullscreen
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-within:opacity-100")
        }
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <ControlButton
          label={playing ? "Pause" : "Play"}
          onClick={togglePlay}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </ControlButton>
        <ControlButton
          label={muted ? "Unmute (will pause site music)" : "Mute"}
          onClick={toggleMute}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </ControlButton>
        <ControlButton
          label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        color: "#FAFAF9",
        backdropFilter: "blur(6px)",
        borderColor: "rgba(255, 255, 255, 0.18)",
      }}
      className="pointer-events-auto inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors hover:bg-[rgba(255,255,255,0.22)]"
    >
      {children}
    </button>
  );
}

function Meta({ piece }: { piece: ExperimentPiece }) {
  return (
    <div className="flex flex-col min-w-0 flex-1">
      <h3
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
          fontWeight: 500,
        }}
        className="text-lg md:text-xl leading-snug mb-1"
      >
        {piece.title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-brand)",
        }}
        className="text-[11px] uppercase tracking-wider mb-3"
      >
        {piece.subtitle}
      </p>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-secondary)",
        }}
        className="text-sm md:text-[15px] leading-relaxed mb-4"
      >
        {piece.description}
      </p>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-muted)",
        }}
        className="text-[11px] uppercase tracking-wider mb-4"
      >
        {piece.date}
      </p>

      <a
        href={piece.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-muted)",
          borderColor: "var(--color-border)",
        }}
        className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] transition-colors duration-150 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] mt-auto"
      >
        <ExternalLink size={13} />
        {piece.sourceLabel}
      </a>
    </div>
  );
}
