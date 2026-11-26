import type {
  Category,
  Supplement,
  SupplementGroup,
  SupplementPrice,
  SupplementGroupPrice,
} from "@prisma/client";
import { CategoriesSection } from "./categories-section";
import { SupplementsSection } from "./supplements-section";
import type { SelectableLicenseType } from "./license-type-checklist";

type SupplementWithPrice = Supplement & {
  supplementGroup: SupplementGroup | null;
  prices: SupplementPrice[];
  typeLinks: { typeId: string }[];
};

type SupplementGroupWithPrices = SupplementGroup & {
  supplements: Supplement[];
  groupPrices: SupplementGroupPrice[];
  typeLinks: { typeId: string }[];
};

type CategoryWithCount = Category & {
  _count: { memberships: number };
};

type Props = {
  categories: CategoryWithCount[];
  supplements: SupplementWithPrice[];
  supplementGroups: SupplementGroupWithPrices[];
  licenseTypes: SelectableLicenseType[];
  seasonId: string;
};

export function StandaloneSections({
  categories,
  supplements,
  supplementGroups,
  licenseTypes,
  seasonId,
}: Props) {
  return (
    <div className="space-y-6">
      <CategoriesSection categories={categories} seasonId={seasonId} />
      <SupplementsSection
        supplements={supplements}
        supplementGroups={supplementGroups}
        licenseTypes={licenseTypes}
        seasonId={seasonId}
      />
    </div>
  );
}
