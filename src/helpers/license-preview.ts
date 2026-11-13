import { buildCategoryOptions, type CategoryOption } from "./category-options";
import type { CategoryOffering } from "@/types";
import { groupOfferingsByCategory } from "./category-offerings";
import {
  checkPublishReadiness,
  type PublishReadiness,
} from "./license-readiness";
import {
  resolveLicenseVisibility,
  type LicenseVisibility,
} from "./license-visibility";

export type SubtypePreview = {
  id: string;
  name: string;
  isDraft: boolean;
  /** False when no category is priced: the wizard leaves the modality out. */
  isVisible: boolean;
  categories: CategoryOption[];
};

export type LicenseTypePreview = {
  visibility: LicenseVisibility;
  readiness: PublishReadiness;
  subtypes: SubtypePreview[];
};

type SeasonCategory = {
  id: string;
  name: string;
};

type PreviewSource = {
  active: boolean;
  publishedAt: Date | null;
  subtypes: {
    id: string;
    name: string;
    active: boolean;
    publishedAt: Date | null;
  }[];
  offerings: {
    categoryId: string;
    subtypeId: string;
    price: number;
    category: {
      id: string;
      name: string;
      description: string;
      active: boolean;
    } | null;
  }[];
};

/**
 * Every category of the season, carrying the prices this federation has for
 * it. A category nobody priced still gets a row: a forgotten category is the
 * mistake the preview exists to catch, and leaving it out would hide it.
 */
function listAllCategories(
  categories: SeasonCategory[],
  offerings: PreviewSource["offerings"],
): CategoryOffering[] {
  const pricedCategories = groupOfferingsByCategory(offerings);

  return categories.map(
    (category) =>
      pricedCategories.find((priced) => priced.id === category.id) ?? {
        id: category.id,
        name: category.name,
        description: "",
        active: true,
        prices: [],
      },
  );
}

/**
 * Works out what a member could contract for this federation, applying the
 * same price rules as the public wizard. Runs on data the admin page already
 * loads, so the preview costs no extra queries.
 */
export function buildLicenseTypePreview(
  licenseType: PreviewSource,
  categories: SeasonCategory[],
): LicenseTypePreview {
  const categoryOfferings = listAllCategories(categories, licenseType.offerings);
  const activeSubtypes = licenseType.subtypes.filter(
    (subtype) => subtype.active,
  );

  const subtypes = activeSubtypes.map((subtype) => {
    const categories = buildCategoryOptions(categoryOfferings, subtype.id);
    return {
      id: subtype.id,
      name: subtype.name,
      isDraft: subtype.publishedAt === null,
      isVisible: categories.some((category) => category.price !== null),
      categories,
    };
  });

  return {
    visibility: resolveLicenseVisibility(licenseType),
    readiness: checkPublishReadiness(
      activeSubtypes.map((subtype) => subtype.id),
      categories.map((category) => category.id),
      licenseType.offerings,
    ),
    subtypes,
  };
}
