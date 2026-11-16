import { cn } from "@/lib/utils";

export type PillTone = "positive" | "negative" | "warning" | "neutral";

const TONE_STYLES: Record<PillTone, string> = {
  positive: "bg-[var(--pill-positive-bg)] text-[var(--pill-positive-ink)]",
  negative: "bg-[var(--pill-negative-bg)] text-[var(--pill-negative-ink)]",
  warning: "bg-[var(--pill-warning-bg)] text-[var(--pill-warning-ink)]",
  neutral: "bg-[var(--pill-neutral-bg)] text-[var(--pill-neutral-ink)]",
};

/**
 * A pale tint with the dark of its own hue, never a saturated block: a column
 * of filled chips ends up louder than the data it is meant to qualify.
 */
export function StatusPill({
  tone,
  children,
}: {
  tone: PillTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center whitespace-nowrap rounded-sm px-2 text-xs font-medium",
        TONE_STYLES[tone],
      )}
    >
      {children}
    </span>
  );
}
