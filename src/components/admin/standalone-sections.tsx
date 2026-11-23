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
};

export function StandaloneSections({
  categories,
  supplements,
  supplementGroups,
  seasonId,
}: Props) {
  return (
    <div className="space-y-6">
      <CategoriesSection categories={categories} seasonId={seasonId} />
      <SupplementGroupsSection
        supplementGroups={supplementGroups}
        seasonId={seasonId}
      />
      <SupplementsSection
        supplements={supplements}
        supplementGroups={supplementGroups}
        seasonId={seasonId}
      />
    </div>
  );
}
