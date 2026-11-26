"use client";

import { useState } from "react";
import type {
  Supplement,
  SupplementGroup,
  SupplementPrice,
  SupplementGroupPrice,
} from "@prisma/client";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAdminSellabilityLookups } from "@/helpers/admin-sellability-lookups";
import { supplementBlockReason } from "@/helpers/supplement-block-reason";
import { selectOfferedTypes } from "@/helpers/offered-license-types";
import { SupplementRow } from "./supplement-row";
import { SupplementFormDialog } from "./supplement-form-dialog";
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

type Props = {
  supplements: SupplementWithPrice[];
  supplementGroups: SupplementGroupWithPrices[];
  licenseTypes: SelectableLicenseType[];
  seasonId: string;
};

export function SupplementsSection({
  supplements,
  supplementGroups,
  licenseTypes,
  seasonId,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // The panel judges what is on sale with the wizard's own rule, so the two
  // can never disagree about why an extra is missing.
  const lookups = buildAdminSellabilityLookups(supplements, supplementGroups);
  const linksByGroupId = new Map(
    supplementGroups.map((group) => [group.id, group.typeLinks]),
  );

  return (
    <div className="rounded-lg border px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Suplementos ({supplements.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {supplements.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin suplementos todavía.
            </p>
          )}
          {supplements.map((supplement) => {
            // A grouped supplement is offered where its group is.
            const links =
              supplement.supplementGroupId === null
                ? supplement.typeLinks
                : (linksByGroupId.get(supplement.supplementGroupId) ?? []);
            const typeIds = links.map((link) => link.typeId);

            return (
              <SupplementRow
                key={supplement.id}
                supplement={supplement}
                supplementGroups={supplementGroups}
                licenseTypes={licenseTypes}
                offer={{
                  blocker: supplementBlockReason(supplement, lookups),
                  offeredTypes: selectOfferedTypes(typeIds, licenseTypes),
                }}
                selectedTypeIds={supplement.typeLinks.map((l) => l.typeId)}
                seasonId={seasonId}
              />
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="mt-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Añadir suplemento
          </Button>
          <SupplementFormDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            seasonId={seasonId}
            supplementGroups={supplementGroups}
            licenseTypes={licenseTypes}
            selectedTypeIds={[]}
          />
        </div>
      )}
    </div>
  );
}
