import type { Prisma } from "@prisma/client";
import type { CatalogIdMaps } from "@/lib/season-entity-copy";

/**
 * Rebuilds which federation offers which extras, against the copied catalog.
 *
 * There is no `seasonId` to pass: a link is only ever a pair of ids, and the
 * federation it names already belongs to the season it was copied into. That is
 * also what makes the remap mandatory — pointing a new year's link at last
 * year's federation would offer the extra in a row no longer on sale.
 *
 * A link whose two ends did not both make it across is dropped rather than
 * half-copied, the same rule the prices follow.
 *
 * The copy is faithful, not tidy: a grouped supplement that somehow carries its
 * own links arrives with them. They change nothing — the group answers for its
 * members — and the next save in the panel clears them.
 */
export async function copySeasonSupplementLinks(
  tx: Prisma.TransactionClient,
  sourceId: string,
  maps: CatalogIdMaps,
): Promise<void> {
  const [links, groupLinks] = await Promise.all([
    tx.licenseTypeSupplement.findMany({
      where: { type: { seasonId: sourceId } },
    }),
    tx.licenseTypeSupplementGroup.findMany({
      where: { type: { seasonId: sourceId } },
    }),
  ]);

  const linkData = links.flatMap((row) => {
    const typeId = maps.types.get(row.typeId);
    const supplementId = maps.supplements.get(row.supplementId);
    if (!typeId || !supplementId) return [];
    return [{ typeId, supplementId }];
  });

  const groupLinkData = groupLinks.flatMap((row) => {
    const typeId = maps.types.get(row.typeId);
    const groupId = maps.groups.get(row.groupId);
    if (!typeId || !groupId) return [];
    return [{ typeId, groupId }];
  });

  if (linkData.length > 0) {
    await tx.licenseTypeSupplement.createMany({ data: linkData });
  }
  if (groupLinkData.length > 0) {
    await tx.licenseTypeSupplementGroup.createMany({ data: groupLinkData });
  }
}
