import { prisma } from "@/lib/prisma";
import { readCatalogRow } from "@/lib/catalog-row";
import type { CatalogModelName } from "@/types/catalog-propagation";

/** A copy of the same catalog entity living in another, still-open season. */
export type LineageSibling = { id: string; year: number };

type SiblingQuery = {
  lineageId: string;
  seasonId: string;
  firstOpenYear: number;
};

/**
 * The copies of one catalog entity that an edit could also reach.
 *
 * Only seasons from the current calendar year onwards: a closed season is the
 * report of what the club charged, and renaming a row there would contradict
 * the label the member already has in their email
 * (`Membership.licenseLabelSnapshot`). So closed years are not offered, which
 * is also why they can never be picked by mistake.
 */
export async function findOpenLineageSiblings(
  model: CatalogModelName,
  id: string,
): Promise<LineageSibling[]> {
  const row = await readCatalogRow(model, id);
  if (!row) return [];

  const query: SiblingQuery = {
    lineageId: row.lineageId,
    seasonId: row.seasonId,
    firstOpenYear: new Date().getFullYear(),
  };

  const siblings = await findSiblings(model, query);
  return siblings.map((sibling) => ({
    id: sibling.id,
    year: sibling.season.year,
  }));
}

type SiblingRow = { id: string; season: { year: number } };

function findSiblings(
  model: CatalogModelName,
  { lineageId, seasonId, firstOpenYear }: SiblingQuery,
): Promise<SiblingRow[]> {
  const args = {
    where: {
      lineageId,
      seasonId: { not: seasonId },
      season: { year: { gte: firstOpenYear } },
    },
    select: { id: true, season: { select: { year: true } } },
    orderBy: { season: { year: "asc" } },
  } as const;

  switch (model) {
    case "licenseType":
      return prisma.licenseType.findMany(args);
    case "licenseSubtype":
      return prisma.licenseSubtype.findMany(args);
    case "category":
      return prisma.category.findMany(args);
    case "supplement":
      return prisma.supplement.findMany(args);
    case "supplementGroup":
      return prisma.supplementGroup.findMany(args);
  }
}
