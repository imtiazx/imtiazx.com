import { person } from "@/lib/person";
import { BrandIcon, type BrandName } from "@/components/ui/BrandIcon";

const SOCIALS: { name: BrandName; label: string; href: string }[] = [
  { name: "github", label: "GitHub", href: person.social.github },
  { name: "linkedin", label: "LinkedIn", href: person.social.linkedin },
  { name: "kaggle", label: "Kaggle", href: person.social.kaggleUrl },
  { name: "twitter", label: "Twitter", href: person.social.twitterUrl },
];

export function Footer() {
  return (
    <footer
      className="w-full flex items-center justify-end gap-4 pr-6 py-4 border-t"
      style={{ borderTopColor: "var(--color-border)" }}
    >
      {SOCIALS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="transition-colors duration-150 hover:text-[var(--color-brand)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <BrandIcon name={s.name} size={18} />
        </a>
      ))}
    </footer>
  );
}
