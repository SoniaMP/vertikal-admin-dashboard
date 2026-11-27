import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions";
import {
  supplementPriceSchema,
  supplementGroupPriceSchema,
} from "@/validations/license";

export type PriceTarget = { supplementId: string } | { groupId: string };

function rejected(message: string | undefined): ActionResult {
  return { success: false, error: message ?? "Datos inválidos" };
}

async function writeSupplementPrice(
  supplementId: string,
  cents: number | null,
): Promise<ActionResult | null> {
  const supplement = await prisma.supplement.findUnique({
    where: { id: supplementId },
    select: { seasonId: true, supplementGroupId: true },
  });
  if (!supplement) return null;

  // A grouped supplement is sold at its group's price, so it carries none of
  // its own — not even one left behind by a supplement that has since joined
  // a group. The same rule the federation links follow.
  const seasonId = supplement.seasonId;
  const wanted = supplement.supplementGroupId === null ? cents : null;

  if (wanted === null) {
    await prisma.supplementPrice.deleteMany({
      where: { seasonId, supplementId },
    });
    return null;
  }

  const parsed = supplementPriceSchema.safeParse({
    seasonId,
    supplementId,
    price: wanted,
  });
  if (!parsed.success) return rejected(parsed.error.issues[0]?.message);

  await prisma.supplementPrice.upsert({
    where: { seasonId_supplementId: { seasonId, supplementId } },
    create: { seasonId, supplementId, price: wanted },
    update: { price: wanted },
  });
  return null;
}

async function writeGroupPrice(
  groupId: string,
  cents: number | null,
): Promise<ActionResult | null> {
  const group = await prisma.supplementGroup.findUnique({
    where: { id: groupId },
    select: { seasonId: true },
  });
  if (!group) return null;

  const seasonId = group.seasonId;

  if (cents === null) {
    await prisma.supplementGroupPrice.deleteMany({
      where: { seasonId, groupId },
    });
    return null;
  }

  const parsed = supplementGroupPriceSchema.safeParse({
    seasonId,
    groupId,
    price: cents,
  });
  if (!parsed.success) return rejected(parsed.error.issues[0]?.message);

  await prisma.supplementGroupPrice.upsert({
    where: { seasonId_groupId: { seasonId, groupId } },
    create: { seasonId, groupId, price: cents },
    update: { price: cents },
  });
  return null;
}

/**
 * Sets what an extra costs in its own season, or clears it.
 *
 * The year is read from the row rather than taken from the form: a price
 * belongs to the season the extra lives in, and no id travelling in a request
 * can move it to another one. Null leaves the extra unpriced on purpose, which
 * the panel reports as "sin precio" and the wizard honours by not offering it.
 *
 * Returns the error to show, or null when the write went through.
 */
export async function writeSeasonPrice(
  target: PriceTarget,
  cents: number | null,
): Promise<ActionResult | null> {
  if ("groupId" in target) return writeGroupPrice(target.groupId, cents);
  return writeSupplementPrice(target.supplementId, cents);
}
