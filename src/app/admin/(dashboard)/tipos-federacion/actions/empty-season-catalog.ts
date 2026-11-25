"use server";

import { prisma } from "@/lib/prisma";
import { clearSeasonCatalog } from "@/lib/season-catalog-clear";
import { revalidatePath } from "next/cache";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { isClosedSeason } from "@/helpers/closed-season";

/**
 * Puts a year back where it was before anybody touched it: no catalog and no
 * season row, exactly like a year nobody has opened yet.
 *
 * The row goes too because the screen tells the two apart. A row with an
 * empty catalog shows every section at zero; no row shows the empty state
 * that invites cloning. Nothing is lost by dropping it: the season is the
 * calendar year, and the row comes back the first time something needs it.
 *
 * The guards are the clone's: a closed year is a record, and a year with
 * memberships holds the prices somebody was charged. A membership created
 * between the check and the delete still points at the row, so the delete
 * fails and the transaction leaves the year untouched.
 */
export async function emptySeasonCatalog(year: number): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  if (!Number.isInteger(year)) {
    return { success: false, error: "Año inválido." };
  }

  if (isClosedSeason(year, new Date().getFullYear())) {
    return {
      success: false,
      error: `La temporada ${year} está cerrada: su catálogo ya no se puede cambiar.`,
    };
  }

  const season = await prisma.season.findUnique({
    where: { year },
    include: { _count: { select: { memberships: true } } },
  });

  // No row means the year never had anything in it: already empty.
  if (!season) return { success: true };

  if (season._count.memberships > 0) {
    return {
      success: false,
      error: `La temporada ${year} ya tiene membresías emitidas. Vaciarla borraría los precios con los que se cobraron.`,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await clearSeasonCatalog(tx, season.id);
      await tx.season.delete({ where: { id: season.id } });
    });
  } catch (error) {
    console.error("emptySeasonCatalog failed", error);
    return {
      success: false,
      error: `No se pudo vaciar la temporada ${year}. No se ha borrado nada; inténtalo de nuevo.`,
    };
  }

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}
