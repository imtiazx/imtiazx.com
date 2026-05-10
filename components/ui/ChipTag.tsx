interface ChipTagProps {
  label: string;
}

export function ChipTag({ label }: ChipTagProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        color: "var(--color-text-muted)",
        borderColor: "var(--color-border)",
      }}
      className="inline-block border rounded px-2 py-0.5 text-[11px] bg-transparent transition-colors duration-150 hover:bg-[var(--color-surface)]"
    >
      {label}
    </span>
  );
}
