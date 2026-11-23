import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/settings";
import { selectSellableSubtypes } from "@/helpers/sellable-subtypes";
import { groupOfferingsByCategory } from "@/helpers/category-offerings";
import { selectSellableSupplements } from "@/helpers/sellable-supplements";
import type {
  LicenseCatalogType,
  SupplementSummary,
  SupplementGroupSummary,
} from "@/types";

export async function fetchLicenseCatalog(): Promise<LicenseCatalogType[]> {
  const season = await getActiveSeason();

  const [types, offerings, supplements, supplementPrices, groupPrices] =
    await Promise.all([
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
      prisma.supplement.findMany({
        where: { seasonId: season.id, active: true },
        include: { supplementGroup: true },
        orderBy: { name: "asc" },
      }),
      prisma.supplementPrice.findMany({
        where: { seasonId: season.id },
      }),
      prisma.supplementGroupPrice.findMany({
        where: { seasonId: season.id },
      }),
    ]);

  const priceBySupplementId = new Map(
    supplementPrices.map((sp) => [sp.supplementId, sp.price]),
  );
  const priceByGroupId = new Map(
    groupPrices.map((gp) => [gp.groupId, gp.price]),
  );

  // Nothing the club sells is free, so a supplement with no price this season
  // is setup left unfinished, not a gift. Offering it would show the member an
  // extra that looks included and then bounce them at checkout.
  const sellableSupplements = selectSellableSupplements(
    supplements,
    priceBySupplementId,
    priceByGroupId,
  );

  const supplementEntries: SupplementSummary[] = sellableSupplements.map(
    (s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: priceBySupplementId.get(s.id) ?? null,
      active: s.active,
      supplementGroupId: s.supplementGroupId,
      supplementGroup: s.supplementGroup
        ? {
            id: s.supplementGroup.id,
            name: s.supplementGroup.name,
            price: priceByGroupId.get(s.supplementGroup.id) ?? 0,
          }
        : null,
    }),
  );

  const uniqueGroups = new Map<string, SupplementGroupSummary>();
  for (const s of sellableSupplements) {
    if (s.supplementGroup && !uniqueGroups.has(s.supplementGroup.id)) {
      uniqueGroups.set(s.supplementGroup.id, {
        id: s.supplementGroup.id,
        name: s.supplementGroup.name,
        price: priceByGroupId.get(s.supplementGroup.id) ?? 0,
      });
    }
  }

  const catalog = types.map((type) => {
    const typeOfferings = offerings.filter((o) => o.typeId === type.id);

    return {
      id: type.id,
      name: type.name,
      description: type.description,
      active: type.active,
      subtypes: selectSellableSubtypes(type.subtypes, typeOfferings).map((st) => ({
        id: st.id,
        name: st.name,
        description: st.description,
        active: st.active,
        licenseTypeId: st.licenseTypeId,
      })),
      categories: groupOfferingsByCategory(typeOfferings),
      supplements: supplementEntries,
      supplementGroups: [...uniqueGroups.values()],
    };
  });

  // A federation whose modalities are all unpriced would be a card the member
  // can click that leads nowhere, so it stays out of the wizard too.
  return catalog.filter((type) => type.subtypes.length > 0);
}
