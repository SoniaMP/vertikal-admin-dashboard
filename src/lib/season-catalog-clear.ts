import type { Prisma } from "@prisma/client";

/**
 * Deletes everything a season sells: federations, modalities, categories,
 * supplements and every price hung off them. Prices go first, then the rows
 * they point at.
 *
 * Callers must have refused seasons with memberships: those rows point at the
 * offerings this deletes.
 */
export async function clearSeasonCatalog(
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
