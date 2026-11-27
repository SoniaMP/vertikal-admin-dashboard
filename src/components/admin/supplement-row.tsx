"use client";

import { StatusPill } from "./status-pill";
import { cn } from "@/lib/utils";
import { retiredRowClass } from "@/helpers/retired-row-class";
import { PriceReadout } from "./price-readout";
import { SupplementActions } from "./supplement-actions";
import { SupplementOfferLine } from "./supplement-offer-line";
import type { SelectableLicenseType } from "./license-type-checklist";
import type { SupplementBlocker } from "@/helpers/supplement-block-reason";
import type { OfferedType } from "@/helpers/offered-license-types";
import type {
  AdminStandaloneSupplement,
  AdminSupplementGroup,
} from "@/types/admin-catalog";

type Props = {
  supplement: AdminStandaloneSupplement;
  supplementGroups: AdminSupplementGroup[];
  licenseTypes: SelectableLicenseType[];
  /** Where this extra shows up, and why it does not when it does not. */
  offer: {
    blocker: SupplementBlocker | null;
    offeredTypes: OfferedType[];
  };
  selectedTypeIds: string[];
};

/**
 * One standalone supplement: its own price, its own federations.
 *
 * The row reports; the edit panel changes. Price, name and federations are the
 * same decision taken in one place and saved by one button, instead of a field
 * in the list that wrote to the database on the way past.
 *
 * A grouped one never reaches this row — it is listed inside its group, which
 * is where the price and the federations it would otherwise appear to own can
 * actually be changed.
 */
export function SupplementRow({
  supplement,
  supplementGroups,
  licenseTypes,
  offer,
  selectedTypeIds,
}: Props) {
  const seasonPrice = supplement.prices[0]?.price;

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        retiredRowClass(supplement.active),
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-medium">{supplement.name}</span>
          <PriceReadout price={seasonPrice} />
          <StatusPill tone={supplement.active ? "positive" : "neutral"}>
            {supplement.active ? "Activo" : "Inactivo"}
          </StatusPill>
        </div>
        <SupplementActions
          supplement={supplement}
          supplementGroups={supplementGroups}
          licenseTypes={licenseTypes}
          selectedTypeIds={selectedTypeIds}
          price={seasonPrice}
          soldCount={supplement._count.membershipSupplements}
        />
      </div>
      <SupplementOfferLine
        blocker={offer.blocker}
        offeredTypes={offer.offeredTypes}
      />
    </div>
  );
}
