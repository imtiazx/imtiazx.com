"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type {
  ExperimentAlbum as Album,
  ExperimentPiece,
} from "@/lib/experiments";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
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
        "border p-4 md:p-5 flex gap-5 transition-[border-color,box-shadow] duration-200 " +
        // Vertical reel sits beside its meta; horizontal still stacks meta below.
        (isVideo
          ? "flex-row items-stretch"
          : "flex-col items-stretch")
      }
    >
      <MediaFrame piece={piece} prefersReducedMotion={prefersReducedMotion} />
      <Meta piece={piece} />
    </motion.article>
  );
}

function MediaFrame({
  piece,
  prefersReducedMotion,
}: {
  piece: ExperimentPiece;
  prefersReducedMotion: boolean;
}) {
  const isVideo = piece.media.kind === "video";

  return (
    <div
      style={{
        borderColor: "var(--color-border)",
        borderRadius: 10,
        backgroundColor: "var(--color-bg)",
      }}
      className={
        "border overflow-hidden flex-shrink-0 " +
        (isVideo
          // Reel: fixed-width column, fills available height via aspect ratio.
          ? "w-[44%] max-w-[260px] self-stretch"
          // Still: full width of its column, height driven by aspect ratio.
          : "w-full")
      }
    >
      {isVideo ? (
        <ReelPlayer piece={piece} prefersReducedMotion={prefersReducedMotion} />
      ) : (
        <Image
          src={piece.media.src}
          alt={piece.media.alt}
          width={piece.media.width}
          height={piece.media.height}
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="block w-full h-auto"
          priority={false}
        />
      )}
    </div>
  );
}

function ReelPlayer({
  piece,
  prefersReducedMotion,
}: {
  piece: ExperimentPiece;
  prefersReducedMotion: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);

  // Autoplay only when the reel is on-screen. Pause when it scrolls out so
  // off-screen videos don't burn CPU or battery.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (prefersReducedMotion) return;

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (prefersReducedMotion) {
      el.pause();
      return;
    }
    if (inView) {
      void el.play().catch(() => {
        // Autoplay can be blocked (e.g. low-power mode). Poster stays visible;
        // user can tap to play.
      });
    } else {
      el.pause();
    }
  }, [inView, prefersReducedMotion]);

  return (
    <video
      ref={videoRef}
      src={piece.media.src}
      poster={piece.media.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={piece.media.alt}
      style={{
        aspectRatio: `${piece.media.width} / ${piece.media.height}`,
      }}
      className="block w-full h-full object-cover"
    />
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
