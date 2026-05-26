import type { ProjectStatus } from "@/lib/projects";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

type BadgeStyle = { backgroundColor: string; color: string };

const badgeStyle: Record<ProjectStatus, BadgeStyle> = {
  Production:  { backgroundColor: "var(--color-teal)",        color: "#ffffff" },
  Development: { backgroundColor: "var(--color-brand)",       color: "#ffffff" },
  Ideation:    { backgroundColor: "var(--color-amber-light)", color: "var(--color-amber)" },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      style={{
        ...badgeStyle[status],
        fontFamily: "var(--font-sans)",
      }}
      className={`inline-block shrink-0 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${className}`}
    >
      {status}
    </span>
  );
}
