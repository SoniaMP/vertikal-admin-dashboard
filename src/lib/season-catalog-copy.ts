import type { Prisma } from "@prisma/client";
import { copySeasonEntities } from "@/lib/season-entity-copy";
import { copySeasonPrices } from "@/lib/season-price-copy";

/**
 * Replaces a season's whole catalog with a copy of another season's.
 *
 * Copying only the prices would leave the target pointing at the source's
 * federations — rows that belong to a different year, which the panel will not
 * show and the club should not sell. So the entities travel too.
 *
 * The caller has already refused targets that carry memberships, so wiping
 * what was there cannot orphan anything a member paid for.
 */
export async function copySeasonCatalog(
  tx: Prisma.TransactionClient,
  sourceId: string,
  targetId: string,
): Promise<void> {
  await clearSeasonCatalog(tx, targetId);

  const maps = await copySeasonEntities(tx, sourceId, targetId);
  await copySeasonPrices(tx, sourceId, targetId, maps);
}

/** Prices first, then the rows they point at. */
async function clearSeasonCatalog(
  tx: Prisma.TransactionClient,
  seasonId: string,
): Promise<void> {
  await tx.licenseOffering.deleteMany({ where: { seasonId } });
  await tx.supplementPrice.deleteMany({ where: { seasonId } });
  await tx.supplementGroupPrice.deleteMany({ where: { seasonId } });
  await tx.licenseSubtype.deleteMany({ where: { seasonId } });
  await tx.licenseType.deleteMany({ where: { seasonId } });
  await tx.supplement.deleteMany({ where: { seasonId } });
  await tx.supplementGroup.deleteMany({ where: { seasonId } });
  await tx.category.deleteMany({ where: { seasonId } });
}
