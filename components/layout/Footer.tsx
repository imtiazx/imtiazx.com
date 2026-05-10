import Link from "next/link";
import { Globe, Hash } from "lucide-react";
import { person } from "@/lib/person";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t"
      style={{ borderTopColor: "var(--color-border)" }}
    >
      <div
        className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span>
          {year} {person.name}
        </span>

        <div className="flex items-center gap-4">
          {person.social.github && (
            <Link
              href={person.social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition-colors"
              style={{
                color: "var(--color-text-muted)",
                transitionDuration: "var(--transition-base)",
              }}
            >
              <Globe size={16} />
            </Link>
          )}
          {person.social.hashnode && (
            <Link
              href={person.social.hashnode}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hashnode blog"
              className="transition-colors"
              style={{
                color: "var(--color-text-muted)",
                transitionDuration: "var(--transition-base)",
              }}
            >
              <Hash size={16} />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
