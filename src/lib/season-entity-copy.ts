import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";

/** Old id → new id, so prices can be rebuilt against the copies. */
export type IdMap = Map<string, string>;

export type CatalogIdMaps = {
  types: IdMap;
  subtypes: IdMap;
  categories: IdMap;
  supplements: IdMap;
  groups: IdMap;
};

/**
 * Copies one season's catalog rows into another.
 *
 * Every row is new — new id, same `lineageId` — because the catalog belongs to
 * the season. The lineage is what still ties the copy to the original, so a
 * federation can be followed across years after a rename.
 *
 * Returns the id maps, which is the whole point: the prices are rebuilt
 * against the copies, never against the rows they came from.
 */
export async function copySeasonEntities(
  tx: Prisma.TransactionClient,
  sourceId: string,
  seasonId: string,
): Promise<CatalogIdMaps> {
  const categories: IdMap = new Map();
  for (const row of await tx.category.findMany({
    where: { seasonId: sourceId },
  })) {
    const id = randomUUID();
    categories.set(row.id, id);
    await tx.category.create({
      data: {
        id,
        seasonId,
        lineageId: row.lineageId,
        name: row.name,
        description: row.description,
        active: row.active,
      },
    });
  }

  const groups: IdMap = new Map();
  for (const row of await tx.supplementGroup.findMany({
    where: { seasonId: sourceId },
  })) {
    const id = randomUUID();
    groups.set(row.id, id);
    await tx.supplementGroup.create({
      data: {
        id,
        seasonId,
        lineageId: row.lineageId,
        name: row.name,
        active: row.active,
      },
    });
  }

  const supplements: IdMap = new Map();
  for (const row of await tx.supplement.findMany({
    where: { seasonId: sourceId },
  })) {
    const id = randomUUID();
    supplements.set(row.id, id);
    await tx.supplement.create({
      data: {
        id,
        seasonId,
        lineageId: row.lineageId,
        name: row.name,
        description: row.description,
        active: row.active,
        supplementGroupId: row.supplementGroupId
          ? (groups.get(row.supplementGroupId) ?? null)
          : null,
      },
    });
  }

  const types: IdMap = new Map();
  for (const row of await tx.licenseType.findMany({
    where: { seasonId: sourceId },
  })) {
    const id = randomUUID();
    types.set(row.id, id);
    await tx.licenseType.create({
      data: {
        id,
        seasonId,
        lineageId: row.lineageId,
        name: row.name,
        description: row.description,
        active: row.active,
        publishedAt: row.publishedAt,
      },
    });
  }

  const subtypes: IdMap = new Map();
  for (const row of await tx.licenseSubtype.findMany({
    where: { seasonId: sourceId },
  })) {
    const licenseTypeId = types.get(row.licenseTypeId);
    if (!licenseTypeId) continue;

    const id = randomUUID();
    subtypes.set(row.id, id);
    await tx.licenseSubtype.create({
      data: {
        id,
        seasonId,
        lineageId: row.lineageId,
        name: row.name,
        description: row.description,
        active: row.active,
        publishedAt: row.publishedAt,
        licenseTypeId,
      },
    });
  }

  return { types, subtypes, categories, supplements, groups };
}
