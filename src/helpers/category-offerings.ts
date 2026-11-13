import type { CategoryOffering } from "@/types";

type OfferingWithCategory = {
  categoryId: string;
  subtypeId: string;
  price: number;
  category: {
    id: string;
    name: string;
    description: string;
    active: boolean;
  } | null;
};

/**
 * Collapses a season's offerings into one entry per category, each carrying
 * the price it has for every modality. Shared by the public catalog and the
 * admin preview so both read the same prices the same way.
 */
export function groupOfferingsByCategory(
  offerings: OfferingWithCategory[],
): CategoryOffering[] {
  const categoryMap = new Map<string, CategoryOffering>();

  for (const offering of offerings) {
    if (!offering.category) continue;
    if (!categoryMap.has(offering.categoryId)) {
      categoryMap.set(offering.categoryId, {
        id: offering.category.id,
        name: offering.category.name,
        description: offering.category.description,
        active: offering.category.active,
        prices: [],
      });
    }
    categoryMap.get(offering.categoryId)!.prices.push({
      subtypeId: offering.subtypeId,
      price: offering.price,
    });
  }

  return [...categoryMap.values()];
}
