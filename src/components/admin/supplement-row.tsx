"use client";

import { useTransition } from "react";
import type {
  Supplement,
  SupplementGroup,
  SupplementPrice,
} from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { upsertSupplementPrice } from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { SupplementActions } from "./supplement-actions";
import { SupplementOfferLine } from "./supplement-offer-line";
import type { SelectableLicenseType } from "./license-type-checklist";
import type { SupplementBlocker } from "@/helpers/supplement-block-reason";
import type { OfferedType } from "@/helpers/offered-license-types";

type SupplementWithPrice = Supplement & {
  supplementGroup: SupplementGroup | null;
  prices: SupplementPrice[];
};

type SupplementGroupWithSupplements = SupplementGroup & {
  supplements: Supplement[];
};

type Props = {
  supplement: SupplementWithPrice;
  supplementGroups: SupplementGroupWithSupplements[];
  licenseTypes: SelectableLicenseType[];
  /** Where this extra shows up, and why it does not when it does not. */
  offer: {
    blocker: SupplementBlocker | null;
    offeredTypes: OfferedType[];
  };
  selectedTypeIds: string[];
  seasonId: string;
};

export function SupplementRow({
  supplement,
  supplementGroups,
  licenseTypes,
  offer,
  selectedTypeIds,
  seasonId,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const seasonPrice = supplement.prices[0]?.price;
  const group = supplement.supplementGroup;

  function handlePriceSave(value: string) {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) return;

    startTransition(async () => {
      await upsertSupplementPrice(
        supplement.id,
        seasonId,
        Math.round(amount * 100),
      );
    });
  }

  return (
    <div className="rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium truncate">{supplement.name}</span>
          {group ? (
            <Badge variant="outline">Grupo: {group.name}</Badge>
          ) : (
            <Input
              type="number"
              step="0.01"
              min="0"
              defaultValue={seasonPrice ? (seasonPrice / 100).toFixed(2) : ""}
              placeholder="€"
              className="h-7 w-20 text-center text-xs"
              disabled={isPending}
              onBlur={(event) => handlePriceSave(event.target.value)}
            />
          )}
          <Badge variant={supplement.active ? "default" : "secondary"}>
            {supplement.active ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <SupplementActions
          supplement={supplement}
          supplementGroups={supplementGroups}
          licenseTypes={licenseTypes}
          selectedTypeIds={selectedTypeIds}
        />
      </div>
      <SupplementOfferLine
        blocker={offer.blocker}
        offeredTypes={offer.offeredTypes}
      />
    </div>
  );
}
