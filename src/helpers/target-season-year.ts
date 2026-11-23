/**
 * The season an operation belongs to today.
 *
 * The season is the calendar year, but people sign up for the next one before
 * it starts: from `rolloverDays` before the year ends, an enrolment already
 * counts as next season. So the rule is to look a few days into the future
 * and take that year.
 *
 * Nothing is stored and nothing is marked. Ask again tomorrow and the answer
 * follows the calendar on its own.
 */
export function resolveTargetSeasonYear(
  today: Date,
  rolloverDays: number,
): number {
  const target = new Date(today);
  target.setDate(target.getDate() + rolloverDays);
  return target.getFullYear();
}
