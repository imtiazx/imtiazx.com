"use client";

import { useState } from "react";
import { person } from "@/lib/person";

// GitHub / LinkedIn / Twitter brand glyphs. Lucide 1.14 dropped its brand icons,
// so these are inline SVGs (simple-icons paths) sized like Lucide and filled with
// currentColor, so they inherit the link's color and hover state.
const BRAND_PATHS = {
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  twitter:
    "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
} as const;

function BrandIcon({ name, size = 18 }: { name: keyof typeof BRAND_PATHS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d={BRAND_PATHS[name]} />
    </svg>
  );
}

function ContactField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const fieldStyle: React.CSSProperties = {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
    borderColor: focused ? "var(--color-brand)" : "var(--color-border)",
    boxShadow: focused ? "0 0 0 3px var(--color-brand-light)" : "none",
    fontFamily: "var(--font-sans)",
  };
  const cls =
    "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150";
  return (
    <label className="block">
      <span
        style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}
        className="mb-1.5 block text-[13px]"
      >
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={fieldStyle}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={fieldStyle}
          className={cls}
        />
      )}
    </label>
  );
}

export function FooterCTA() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  const socials: { name: keyof typeof BRAND_PATHS; label: string; href: string }[] = [
    { name: "github", label: "GitHub", href: person.social.github },
    { name: "linkedin", label: "LinkedIn", href: person.social.linkedin },
    { name: "twitter", label: "Twitter", href: person.social.twitterUrl },
  ];

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div aria-hidden className="absolute inset-0">
        <div className="mesh-blob-purple" />
        <div className="mesh-blob-teal" />
      </div>

      <div className="container relative z-10 mx-auto max-w-3xl">
        {/* 1. Philosophy taglines: stacked, left-aligned, thin brand left border. */}
        <ul
          className="flex flex-col gap-3 pl-4"
          style={{
            borderLeft: "2px solid color-mix(in srgb, var(--color-brand) 40%, transparent)",
          }}
        >
          {person.philosophy.map((line) => (
            <li
              key={line}
              style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
              className="text-sm leading-relaxed"
            >
              {line}
            </li>
          ))}
        </ul>

        {/* Contact form -- backend integration pending */}
        <div className="mt-16">
          <div className="flex flex-col gap-4">
            <ContactField
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={setEmail}
            />
            <ContactField
              label="Subject"
              type="text"
              placeholder="What's this about?"
              value={subject}
              onChange={setSubject}
            />
            <ContactField
              label="Message"
              placeholder="Your message..."
              value={message}
              onChange={setMessage}
              multiline
            />

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setNotice("Form coming soon. Email me directly.")}
                style={{ backgroundColor: "var(--color-brand)", fontFamily: "var(--font-sans)" }}
                className="inline-flex items-center rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
              >
                Send Message
              </button>
              {notice && (
                <span
                  role="status"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
                  className="text-sm"
                >
                  {notice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Social icons row */}
        <div className="mt-12 flex flex-wrap items-center gap-6">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
              className="inline-flex items-center gap-2 text-sm transition-colors duration-150 hover:text-[var(--color-brand)]"
            >
              <BrandIcon name={s.name} />
              {s.label}
            </a>
          ))}
        </div>

        {/* 4. Copyright */}
        <div className="mt-12 text-center">
          <span
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}
            className="text-sm"
          >
            2026 ImtiazX
          </span>
        </div>
      </div>
    </section>
  );
}
