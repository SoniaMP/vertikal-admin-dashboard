/**
 * The first day an enrolment counts for a given season.
 *
 * One January back by the rollover days. Derived from the season itself, not
 * from today, so it stays right once the window has already opened and
 * "next year" is no longer this year plus one.
 */
export function resolveSeasonOpensOn(year: number, rolloverDays: number): Date {
  const opensOn = new Date(year, 0, 1);
  opensOn.setDate(opensOn.getDate() - rolloverDays);
  return opensOn;
}
