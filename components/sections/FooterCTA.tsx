"use client";

import { useState } from "react";
import { person } from "@/lib/person";

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
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit() {
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject, message }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  const buttonLabel =
    status === "sending"
      ? "Sending..."
      : status === "sent"
      ? "Message Sent"
      : status === "error"
      ? "Failed -- try again"
      : "Send Message";

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
                onClick={handleSubmit}
                disabled={status === "sending"}
                style={{ backgroundColor: "var(--color-brand)", fontFamily: "var(--font-sans)" }}
                className="inline-flex items-center rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buttonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
