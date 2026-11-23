"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { copySeasonCatalog } from "@/lib/season-catalog-copy";
import { revalidatePath } from "next/cache";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { isClosedSeason } from "@/helpers/closed-season";

/**
 * Copy a whole year of catalog onto another year.
 *
 * Everything travels: federations, modalities, categories, supplements and
 * their prices, each with the state it had — retired arrives retired, a draft
 * arrives a draft. Nothing is filtered out, because deciding what still
 * applies next year is the admin's job, not this function's.
 *
 * Overwriting is the point: the target ends up matching the source exactly, so
 * the admin starts from last year's setup and edits the handful that moved.
 * It is also why a year that already has memberships is refused — those rows
 * point at the offerings this would delete, and the price somebody was charged
 * is not ours to rewrite.
 */
export async function cloneSeasonPrices(
  sourceYear: number,
  targetYear: number,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  if (!Number.isInteger(sourceYear) || !Number.isInteger(targetYear)) {
    return { success: false, error: "Años inválidos." };
  }

  if (sourceYear === targetYear) {
    return {
      success: false,
      error: "No se puede clonar una temporada sobre sí misma.",
    };
  }

  if (isClosedSeason(targetYear, new Date().getFullYear())) {
    return {
      success: false,
      error: `La temporada ${targetYear} está cerrada: sus precios ya no se pueden cambiar.`,
    };
  }

  const source = await prisma.season.findUnique({
    where: { year: sourceYear },
    select: { id: true },
  });

  if (!source) {
    return { success: false, error: `La temporada ${sourceYear} no existe.` };
  }

  const target = await prisma.season.findUnique({
    where: { year: targetYear },
    include: { _count: { select: { memberships: true } } },
  });

  if (target && target._count.memberships > 0) {
    return {
      success: false,
      error: `La temporada ${targetYear} ya tiene membresías emitidas. Clonar borraría los precios con los que se cobraron.`,
    };
  }

  // The copy is one transaction, so a failure anywhere leaves the target year
  // exactly as it was. Catching it turns a rolled-back clone into a message
  // the admin can read instead of a crashed screen that says nothing about
  // whether the year survived.
  try {
    await prisma.$transaction(async (tx) => {
      const targetId = target?.id ?? (await createSeason(tx, targetYear)).id;
      await copySeasonCatalog(tx, source.id, targetId);
    });
  } catch (error) {
    console.error("cloneSeasonPrices failed", error);
    return {
      success: false,
      error: `No se pudo clonar sobre la temporada ${targetYear}. No se ha cambiado nada; inténtalo de nuevo.`,
    };
  }

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

/**
 * A season nobody created on purpose. The season is the calendar year, so the
 * row is bookkeeping: it exists the first time a year needs something hung
 * off it.
 */
function createSeason(tx: Prisma.TransactionClient, year: number) {
  return tx.season.create({
    data: {
      name: String(year),
      year,
      startDate: new Date(`${year}-01-01`),
      endDate: new Date(`${year}-12-31`),
      isActive: false,
    },
  });
}
