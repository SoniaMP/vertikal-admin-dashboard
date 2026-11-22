/**
 * The years the licence catalog can be opened at: from the earliest season on
 * record to five years past the current one. Five is enough room to plan ahead
 * without turning the selector into a scroll, and the past end is whatever the
 * club actually has, so the list grows by itself as seasons accumulate.
 */
export function buildCatalogYears(
  yearsOnRecord: number[],
  currentYear: number,
): number[] {
  const first = Math.min(currentYear, ...yearsOnRecord);
  const years: number[] = [];

  for (let year = first; year <= currentYear + 5; year += 1) {
    years.push(year);
  }

  return years;
}
