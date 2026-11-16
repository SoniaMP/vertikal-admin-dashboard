/**
 * The season as a person reads it: "2026-2027" becomes "Temporada 2026 / 2027".
 * The stored name is a key, not a label, so it is never printed raw.
 */
export function formatSeasonLabel(name: string): string {
  return `Temporada ${name.replace("-", " / ")}`;
}
