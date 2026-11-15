const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A stored `YYYY-MM-DD` as a Spanish member reads it. Built from the string
 * rather than a `Date` on purpose: a birth date has no time zone, and parsing
 * one can shift it a day depending on where the server runs.
 *
 * Anything that is not an ISO date comes back untouched, so a half-typed value
 * is never rewritten under the member's fingers.
 */
export function formatBirthDate(value: string): string {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
