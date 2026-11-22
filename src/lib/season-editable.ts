import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions";
import { isClosedSeason } from "@/helpers/closed-season";

/**
 * Refuses a write aimed at a season that has already closed.
 *
 * The screen hides the controls, but hiding is not enforcing: the prices of a
 * past year are the ones members were charged, and a stale tab or a crafted
 * request must not be able to rewrite them.
 */
export async function requireEditableSeason(
  seasonId: string,
): Promise<ActionResult | null> {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    select: { year: true },
  });

  if (!season) {
    return { success: false, error: "La temporada no existe." };
  }

  if (isClosedSeason(season.year, new Date().getFullYear())) {
    return {
      success: false,
      error: `La temporada ${season.year} está cerrada: sus precios ya no se pueden cambiar.`,
    };
  }

  return null;
}
