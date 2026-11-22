/**
 * The years worth copying prices from: the ones that actually have prices,
 * never the year being filled, most recent first — last season is almost
 * always the one the admin means.
 */
export function selectClonableYears(
  yearsWithPrices: number[],
  targetYear: number,
): number[] {
  return yearsWithPrices
    .filter((year) => year !== targetYear)
    .sort((a, b) => b - a);
}
