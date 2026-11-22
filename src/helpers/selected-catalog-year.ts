/**
 * Which year the licence catalog is showing. A missing, unreadable or
 * unoffered `year` param falls back to the season in force rather than
 * erroring: a mistyped URL is a typo, not a request for a different page.
 */
export function selectCatalogYear(
  raw: string | undefined,
  availableYears: number[],
  fallbackYear: number,
): number {
  const parsed = Number(raw);

  if (!Number.isInteger(parsed)) return fallbackYear;

  return availableYears.includes(parsed) ? parsed : fallbackYear;
}
