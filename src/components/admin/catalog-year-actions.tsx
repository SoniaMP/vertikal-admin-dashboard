import { ClonePricesButton } from "@/components/admin/clone-prices-button";
import { EmptySeasonButton } from "@/components/admin/empty-season-button";
import { CreateLicenseTypeButton } from "@/components/admin/create-license-type-button";

type Props = {
  year: number;
  /** Null while the year has no season row, i.e. nothing in it yet. */
  seasonId: string | null;
  clonableYears: number[];
  hasPrices: boolean;
  hasMemberships: boolean;
  isActiveYear: boolean;
};

/** What an open year can be done to, as a whole. Closed years get none. */
export function CatalogYearActions({
  year,
  seasonId,
  clonableYears,
  hasPrices,
  hasMemberships,
  isActiveYear,
}: Props) {
  return (
    <>
      {/* A year somebody registered in keeps its prices, so no button at all. */}
      {hasPrices && !hasMemberships && (
        <EmptySeasonButton year={year} isActiveYear={isActiveYear} />
      )}
      <ClonePricesButton
        targetYear={year}
        sourceYears={clonableYears}
        willOverwrite={hasPrices}
      />
      {seasonId && <CreateLicenseTypeButton seasonId={seasonId} />}
    </>
  );
}
