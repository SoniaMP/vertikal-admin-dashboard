import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/settings";
import { fetchSeasonSupplementOffer } from "@/lib/season-supplement-offer";
import { selectSellableSubtypes } from "@/helpers/sellable-subtypes";
import { groupOfferingsByCategory } from "@/helpers/category-offerings";
import type { LicenseCatalogType } from "@/types";

export async function fetchLicenseCatalog(): Promise<LicenseCatalogType[]> {
  const season = await getActiveSeason();

  const [types, offerings, supplementOffer] = await Promise.all([
    // Drafts never reach the public wizard: `publishedAt` is the admin
    // saying this federation is ready to be sold.
    prisma.licenseType.findMany({
      where: { seasonId: season.id, active: true, publishedAt: { not: null } },
      include: {
        subtypes: {
          where: { active: true, publishedAt: { not: null } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.licenseOffering.findMany({
      where: { seasonId: season.id },
      include: { category: true },
    }),
    // Each federation gets the extras it offers, never the whole season's.
    fetchSeasonSupplementOffer(season.id),
  ]);

  const catalog = types.map((type) => {
    const typeOfferings = offerings.filter((o) => o.typeId === type.id);

    return {
      id: type.id,
      name: type.name,
      description: type.description,
      active: type.active,
      subtypes: selectSellableSubtypes(type.subtypes, typeOfferings).map(
        (subtype) => ({
          id: subtype.id,
          name: subtype.name,
          description: subtype.description,
          active: subtype.active,
          licenseTypeId: subtype.licenseTypeId,
        }),
      ),
      categories: groupOfferingsByCategory(typeOfferings),
      supplements: supplementOffer.supplementsByTypeId.get(type.id) ?? [],
      supplementGroups: supplementOffer.groupsByTypeId.get(type.id) ?? [],
    };
  });

  // A federation whose modalities are all unpriced would be a card the member
  // can click that leads nowhere, so it stays out of the wizard too.
  return catalog.filter((type) => type.subtypes.length > 0);
}
