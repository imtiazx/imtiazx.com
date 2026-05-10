import type { ProjectStatus } from "@/lib/projects";

interface StatusBadgeProps {
  status: ProjectStatus;
}

const badgeColor: Record<ProjectStatus, string> = {
  Production: "var(--color-teal)",
  Development: "var(--color-purple)",
  Ideation: "var(--color-amber)",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      style={{
        backgroundColor: badgeColor[status],
        fontFamily: "var(--font-mono)",
      }}
      className="inline-block shrink-0 px-2 py-0.5 rounded-full text-[10px] text-white uppercase tracking-wider font-medium"
    >
      {status}
    </span>
  );
}
