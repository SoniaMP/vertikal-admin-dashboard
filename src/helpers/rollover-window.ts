import { resolveSeasonOpensOn } from "@/helpers/season-opens-on";

/** The next season and the day its enrolment window opens. */
export type RolloverWindow = { year: number; opensOn: Date };

/**
 * When the next season's enrolment window opens, given today.
 *
 * The number of days alone is hard to picture — "15 days" does not say
 * whether that is the 16th or the 17th of December — so Ajustes shows the
 * resulting date instead of asking anyone to work it out.
 */
export function resolveRolloverWindow(
  today: Date,
  rolloverDays: number,
): RolloverWindow {
  const year = today.getFullYear() + 1;
  return { year, opensOn: resolveSeasonOpensOn(year, rolloverDays) };
}
