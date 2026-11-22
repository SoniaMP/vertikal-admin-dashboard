import type {
  Category,
  Supplement,
  SupplementGroup,
  SupplementPrice,
  SupplementGroupPrice,
} from "@prisma/client";
import { CategoriesSection } from "./categories-section";
import { SupplementGroupsSection } from "./supplement-groups-section";
import { SupplementsSection } from "./supplements-section";

type SupplementWithPrice = Supplement & {
  supplementGroup: SupplementGroup | null;
  prices: SupplementPrice[];
};

type SupplementGroupWithPrices = SupplementGroup & {
  supplements: Supplement[];
  groupPrices: SupplementGroupPrice[];
};

type CategoryWithCount = Category & {
  _count: { memberships: number };
};

type Props = {
  categories: CategoryWithCount[];
  supplements: SupplementWithPrice[];
  supplementGroups: SupplementGroupWithPrices[];
  seasonId: string;
  isReadOnly: boolean;
};

export function StandaloneSections({
  categories,
  supplements,
  supplementGroups,
  seasonId,
  isReadOnly,
}: Props) {
  return (
    <div className="space-y-6">
      <CategoriesSection categories={categories} />
      <SupplementGroupsSection
        supplementGroups={supplementGroups}
        seasonId={seasonId}
        isReadOnly={isReadOnly}
      />
      <SupplementsSection
        supplements={supplements}
        supplementGroups={supplementGroups}
        seasonId={seasonId}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
