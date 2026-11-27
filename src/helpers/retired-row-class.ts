/**
 * The ground a retired row sits on.
 *
 * A struck-out pill alone is easy to miss in a list that is mostly live rows,
 * so the whole row recedes onto the same neutral the "Inactivo" pill is drawn
 * in: the ground and the label that names it then say one thing instead of
 * two. It is that tint and not a true grey because the panel is a pale ledger
 * — a grey block would read as a different surface rather than as this row,
 * switched off.
 */
export function retiredRowClass(isActive: boolean): string {
  if (isActive) return "";
  return "bg-[var(--pill-neutral-bg)] text-muted-foreground";
}
