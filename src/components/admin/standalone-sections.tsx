import type { Category } from "@prisma/client";
import { CategoriesSection } from "./categories-section";
import { SupplementsSection } from "./supplements-section";
import type { SelectableLicenseType } from "./license-type-checklist";
import type {
  AdminStandaloneSupplement,
  AdminSupplementGroup,
} from "@/types/admin-catalog";

type CategoryWithCount = Category & {
  _count: { memberships: number };
};

type Props = {
  categories: CategoryWithCount[];
  supplements: AdminStandaloneSupplement[];
  supplementGroups: AdminSupplementGroup[];
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
