import { prisma } from "@/lib/prisma";
import { formatSeasonLabel } from "@/helpers/season-label";

/**
 * The active season's label, or null when none is configured or the database
 * cannot be reached. Unlike `getActiveSeason()`, this never throws: the login
 * page has to render even when the data behind a decorative line does not.
 */
export async function fetchActiveSeasonLabel(): Promise<string | null> {
  try {
    const season = await prisma.season.findFirst({ where: { isActive: true } });
    return season ? formatSeasonLabel(season.name) : null;
  } catch {
    return null;
  }
}
