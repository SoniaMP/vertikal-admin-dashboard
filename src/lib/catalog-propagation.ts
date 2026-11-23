import { prisma } from "@/lib/prisma";
import { readCatalogRow } from "@/lib/catalog-row";
import { findOpenLineageSiblings } from "@/lib/catalog-lineage";
import { isClosedSeason } from "@/helpers/closed-season";
import type {
  CatalogModelName,
  PropagationScope,
} from "@/types/catalog-propagation";

/**
 * Copies one catalog edit onto the same entity in the other open seasons.
 *
 * The values are re-read from the row that was just saved rather than passed
 * in, so the copies cannot drift from what the admin actually sees, and a
 * stale client cannot write an old name into next year.
 *
 * Returns how many rows were updated — one per season reached.
 */
export async function propagateCatalogEdit(
  model: CatalogModelName,
  id: string,
  scope: PropagationScope,
): Promise<number> {
  const row = await readCatalogRow(model, id);
  if (!row) return 0;

  const season = await prisma.season.findUnique({
    where: { id: row.seasonId },
    select: { year: true },
  });

  // A closed season is not a source either: its rows are a record of what was
  // charged, not a template for the years still open.
  if (!season || isClosedSeason(season.year, new Date().getFullYear())) {
    return 0;
  }

  const siblings = await findOpenLineageSiblings(model, id);
  if (siblings.length === 0) return 0;

  const ids = siblings.map((sibling) => sibling.id);
  const result =
    scope === "state"
      ? await copyState(model, ids, row.active)
      : await copyTexts(model, ids, row.name, row.description);

  return result.count;
}

function copyState(model: CatalogModelName, ids: string[], active: boolean) {
  const args = { where: { id: { in: ids } }, data: { active } };

  switch (model) {
    case "licenseType":
      return prisma.licenseType.updateMany(args);
    case "licenseSubtype":
      return prisma.licenseSubtype.updateMany(args);
    case "category":
      return prisma.category.updateMany(args);
    case "supplement":
      return prisma.supplement.updateMany(args);
    case "supplementGroup":
      return prisma.supplementGroup.updateMany(args);
  }
}

function copyTexts(
  model: CatalogModelName,
  ids: string[],
  name: string,
  description: string,
) {
  const where = { id: { in: ids } };
  const data = { name, description };

  switch (model) {
    case "licenseType":
      return prisma.licenseType.updateMany({ where, data });
    case "licenseSubtype":
      return prisma.licenseSubtype.updateMany({ where, data });
    case "category":
      return prisma.category.updateMany({ where, data });
    case "supplement":
      return prisma.supplement.updateMany({ where, data });
    case "supplementGroup":
      // A group has no description, only a name.
      return prisma.supplementGroup.updateMany({ where, data: { name } });
  }
}
