"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth, type ActionResult } from "@/lib/actions";
import { isClosedSeason } from "@/helpers/closed-season";

type SourceSeason = Prisma.SeasonGetPayload<{
  include: {
    offerings: true;
    supplementPrices: true;
    supplementGroupPrices: true;
  };
}>;

/**
 * Copy a whole year of prices onto another year.
 *
 * Overwriting is the point: the target ends up matching the source exactly, so
 * the admin starts from last year's numbers and edits the handful that moved.
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
    include: {
      offerings: true,
      supplementPrices: true,
      supplementGroupPrices: true,
    },
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

  await prisma.$transaction(async (tx) => {
    const targetId = target?.id ?? (await createSeason(tx, targetYear)).id;
    await clearPrices(tx, targetId);
    await copyPrices(tx, source, targetId);
  });

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

async function clearPrices(tx: Prisma.TransactionClient, seasonId: string) {
  await tx.licenseOffering.deleteMany({ where: { seasonId } });
  await tx.supplementPrice.deleteMany({ where: { seasonId } });
  await tx.supplementGroupPrice.deleteMany({ where: { seasonId } });
}

async function copyPrices(
  tx: Prisma.TransactionClient,
  source: SourceSeason,
  seasonId: string,
) {
  await tx.licenseOffering.createMany({
    data: source.offerings.map((offering) => ({
      seasonId,
      typeId: offering.typeId,
      subtypeId: offering.subtypeId,
      categoryId: offering.categoryId,
      price: offering.price,
    })),
  });

  await tx.supplementPrice.createMany({
    data: source.supplementPrices.map((price) => ({
      seasonId,
      supplementId: price.supplementId,
      price: price.price,
    })),
  });

  await tx.supplementGroupPrice.createMany({
    data: source.supplementGroupPrices.map((price) => ({
      seasonId,
      groupId: price.groupId,
      price: price.price,
    })),
  });
}
