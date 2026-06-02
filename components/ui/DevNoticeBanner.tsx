"use client";

import { usePathname } from "next/navigation";

// Site-wide development notice. Hidden on the intro gateway ("/") because that
// route is full-screen with body overflow locked; a banner above it would push
// the scene below the viewport and get clipped.
export function DevNoticeBanner() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="dev-notice-banner" role="status" aria-live="polite">
      <div className="dev-notice-content">
        <Ladybug className="dev-notice-bug-lead" />
        <span className="dev-notice-text">
          Site under active development. Current content is placeholder data.
          Please visit again in a week or two for the accurate version.
        </span>
        <span className="dev-notice-quote">
          <span aria-hidden>&ldquo;</span>
          Don&rsquo;t squash me, I&rsquo;m still debugging.
          <span aria-hidden>&rdquo;</span>
        </span>
      </div>

      <span className="dev-notice-roamer" aria-hidden>
        <Ladybug className="dev-notice-bug-roamer" />
      </span>

      <style jsx>{`
        .dev-notice-banner {
          position: relative;
          width: 100%;
          background: linear-gradient(
            90deg,
            color-mix(in srgb, var(--color-coral) 12%, transparent) 0%,
            color-mix(in srgb, var(--color-coral) 22%, transparent) 50%,
            color-mix(in srgb, var(--color-coral) 12%, transparent) 100%
          );
          border-bottom: 1px solid
            color-mix(in srgb, var(--color-coral) 38%, transparent);
          overflow: hidden;
          z-index: 60;
        }
        .dev-notice-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 10px 14px;
          padding: 8px 16px;
          font-family: var(--font-sans);
          font-size: 12.5px;
          line-height: 1.45;
          color: var(--color-text-primary);
          text-align: center;
        }
        .dev-notice-text {
          font-weight: 500;
        }
        .dev-notice-quote {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-style: italic;
          color: var(--color-coral);
          font-weight: 500;
        }
        .dev-notice-bug-lead {
          flex-shrink: 0;
          animation: bugBob 1.6s ease-in-out infinite;
        }
        .dev-notice-roamer {
          position: absolute;
          left: 0;
          bottom: 2px;
          z-index: 1;
          pointer-events: none;
          opacity: 0.55;
          animation: bugCrawl 22s linear infinite;
        }
        @keyframes bugCrawl {
          0% {
            transform: translateX(-24px) rotate(0deg);
          }
          25% {
            transform: translateX(25vw) rotate(6deg);
          }
          50% {
            transform: translateX(50vw) rotate(-5deg);
          }
          75% {
            transform: translateX(75vw) rotate(4deg);
          }
          100% {
            transform: translateX(calc(100vw + 24px)) rotate(0deg);
          }
        }
        @keyframes bugBob {
          0%, 100% {
            transform: translateY(0) rotate(-2deg);
          }
          50% {
            transform: translateY(-1px) rotate(2deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .dev-notice-bug-lead,
          .dev-notice-roamer {
            animation: none;
          }
          .dev-notice-roamer {
            transform: translateX(16px);
          }
        }
        @media (max-width: 540px) {
          .dev-notice-content {
            font-size: 11.5px;
            padding: 7px 12px;
          }
        }
      `}</style>
    </div>
  );
}

function Ladybug({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="14"
      viewBox="0 0 40 28"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="22" cy="14" rx="15" ry="11" fill="var(--color-coral)" />
      <path
        d="M22 3 L22 25"
        stroke="#0B0B0B"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="7" cy="14" r="5" fill="#0B0B0B" />
      <circle cx="5.5" cy="12" r="0.9" fill="#FAFAF9" />
      <circle cx="15" cy="10" r="1.4" fill="#0B0B0B" />
      <circle cx="15" cy="18" r="1.4" fill="#0B0B0B" />
      <circle cx="24" cy="8" r="1.4" fill="#0B0B0B" />
      <circle cx="24" cy="20" r="1.4" fill="#0B0B0B" />
      <circle cx="31" cy="14" r="1.4" fill="#0B0B0B" />
      <path
        d="M4 10 L1 6 M4 10 L0 9"
        stroke="#0B0B0B"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
