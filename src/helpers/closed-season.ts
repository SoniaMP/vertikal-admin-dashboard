/**
 * A season that belongs to a year already past. Its prices are what the club
 * actually charged, so the panel shows them and stops there: the current year
 * and the ones ahead of it are the editable ones.
 */
export function isClosedSeason(year: number, currentYear: number): boolean {
  return year < currentYear;
}
