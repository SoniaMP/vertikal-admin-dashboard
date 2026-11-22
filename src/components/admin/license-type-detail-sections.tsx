import type {
  LicenseTypeWithRelations,
  CategoryWithCount,
} from "./license-types-table";
import { SubtypesSection } from "./subtypes-section";
import { OfferingMatrixSection } from "./offering-matrix-section";

type Props = {
  licenseType: LicenseTypeWithRelations;
  categories: CategoryWithCount[];
  seasonId: string;
  isReadOnly: boolean;
};

export function DetailSections({
  licenseType: lt,
  categories,
  seasonId,
  isReadOnly,
}: Props) {
  return (
    <>
      <SubtypesSection
        licenseTypeId={lt.id}
        subtypes={lt.subtypes}
        offerings={lt.offerings}
      />
      <OfferingMatrixSection
        seasonId={seasonId}
        isReadOnly={isReadOnly}
        typeId={lt.id}
        categories={categories}
        subtypes={lt.subtypes}
        offerings={lt.offerings}
      />
    </>
  );
}
