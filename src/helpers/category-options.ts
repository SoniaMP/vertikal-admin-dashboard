import type { CategoryOffering } from "@/types";

export type CategoryOption = {
  id: string;
  name: string;
  /** Null when the catalog has no offering for this category in the modality. */
  price: number | null;
};

/**
 * Decides which categories a member may pick once they chose a modality.
 * A category without an offering for that modality cannot be bought, so the
 * wizard must not let it through: the server would reject the whole
 * registration at payment time, after every field has been filled in.
 */
export function buildCategoryOptions(
  categories: CategoryOffering[],
  subtypeId: string,
): CategoryOption[] {
  return categories
    .filter((category) => category.active)
    .map((category) => ({
      id: category.id,
      name: category.name,
      price:
        category.prices.find((p) => p.subtypeId === subtypeId)?.price ?? null,
    }));
}
