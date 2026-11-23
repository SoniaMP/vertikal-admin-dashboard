import { resolveTargetSeasonYear } from "@/helpers/target-season-year";
import { getSeasonRolloverDays } from "@/lib/settings";

/**
 * The season in force, as a line to print, or null when the database cannot
 * be reached. Unlike `getActiveSeason()`, this neither creates the row nor
 * throws: the login page has to render even when the data behind a
 * decorative line does not.
 */
export async function fetchActiveSeasonLabel(): Promise<string | null> {
  try {
    const year = resolveTargetSeasonYear(
      new Date(),
      await getSeasonRolloverDays(),
    );
    return `Temporada ${year}`;
  } catch {
    return null;
  }
}
