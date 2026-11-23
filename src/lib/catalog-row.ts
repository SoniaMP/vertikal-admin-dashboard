import { prisma } from "@/lib/prisma";
import type { CatalogModelName } from "@/types/catalog-propagation";

/**
 * The part of a catalog row that can be shared across seasons.
 *
 * Deliberately not everything: prices, parents and group membership are ids
 * that belong to one season, so they can never travel to another.
 */
export type CatalogRow = {
  name: string;
  /** Empty string when there is none; the column is not nullable. */
  description: string;
  active: boolean;
  lineageId: string;
  seasonId: string;
};

const SHARED = {
  name: true,
  description: true,
  active: true,
  lineageId: true,
  seasonId: true,
} as const;

/**
 * Reads the shared part of one catalog row, whichever table it lives in.
 *
 * The switch is on purpose. A generic delegate lookup would need casts that
 * throw away exactly the typing that keeps a field name honest here.
 */
export async function readCatalogRow(
  model: CatalogModelName,
  id: string,
): Promise<CatalogRow | null> {
  const where = { id };

  switch (model) {
    case "licenseType":
      return prisma.licenseType.findUnique({ where, select: SHARED });
    case "licenseSubtype":
      return prisma.licenseSubtype.findUnique({ where, select: SHARED });
    case "category":
      return prisma.category.findUnique({ where, select: SHARED });
    case "supplement":
      return prisma.supplement.findUnique({ where, select: SHARED });
    case "supplementGroup": {
      // Groups are just a name and a state; there is no description to share.
      const row = await prisma.supplementGroup.findUnique({
        where,
        select: { name: true, active: true, lineageId: true, seasonId: true },
      });
      return row ? { ...row, description: "" } : null;
    }
  }
}
