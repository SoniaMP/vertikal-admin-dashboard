import { cn } from "@/lib/utils";

type Props = {
  name: string;
  isRetired: boolean;
};

/**
 * One federation an extra is offered in.
 *
 * Not a `Badge`, on purpose. A badge in this panel means state — a pale tint
 * with the dark of its own hue, rounded like a pill. This is a reference to
 * another row, and it has to read as one from across the table, so it differs
 * in shape rather than in loudness: a square-cornered tag with a visible rule
 * and a solid dot of the club's green, which the panel reserves for what the
 * data says. Shape and dot carry the difference, so no new hue enters a
 * deliberately achromatic screen.
 *
 * A retired federation keeps its place with the dot hollowed and the name
 * struck through: an admin needs to see what would come back, and a chip that
 * simply vanished would read as a link somebody removed.
 */
export function FederationChip({ name, isRetired }: Props) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 text-xs font-medium",
        isRetired
          ? "border-border text-muted-foreground"
          : "border-input text-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          isRetired ? "border border-muted-foreground" : "bg-[var(--club)]",
        )}
      />
      <span className={isRetired ? "line-through" : undefined}>{name}</span>
    </span>
  );
}
