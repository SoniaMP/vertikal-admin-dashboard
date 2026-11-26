"use client";

import { useState } from "react";
import type {
  Supplement,
  SupplementGroup,
  SupplementPrice,
  SupplementGroupPrice,
} from "@prisma/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { buildAdminSellabilityLookups } from "@/helpers/admin-sellability-lookups";
import { supplementBlockReason } from "@/helpers/supplement-block-reason";
import { selectOfferedTypes } from "@/helpers/offered-license-types";
import { SupplementGroupRow } from "./supplement-group-row";
import { SupplementRow } from "./supplement-row";
import { SupplementAddActions } from "./supplement-add-actions";
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

/**
 * Everything the club sells on top of a licence, in one list.
 *
 * One section rather than two, because the member already sees one: in the
 * wizard the extras come as a single list where a group is just a box inside
 * it. Two admin sections would mean configuring a shape the member never
 * meets, which is what sent an admin looking for a grouped supplement's
 * federations on the supplement instead of on its group.
 *
 * Groups come first and standalone extras after. A group is a container, not
 * an item, so the count is the number of supplements: a reader asking "how
 * many extras do we sell" gets that number, with no arithmetic across
 * headings.
 */
export function SupplementsSection({
  supplements,
  supplementGroups,
  licenseTypes,
  seasonId,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // The panel judges what is on sale with the wizard's own rule, so the two
  // can never disagree about why an extra is missing.
  const lookups = buildAdminSellabilityLookups(supplements, supplementGroups);
  // Grouped ones are listed inside their group, where the price and the
  // federations they inherit are the ones you can actually change.
  const standalone = supplements.filter(
    (supplement) => supplement.supplementGroupId === null,
  );
  const isEmpty = supplements.length === 0 && supplementGroups.length === 0;

  return (
    <div className="rounded-lg border px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
          {isEmpty && (
            <p className="text-sm text-muted-foreground">
              Sin suplementos todavía.
            </p>
          )}
          {supplementGroups.map((group) => (
            <SupplementGroupRow
              key={group.id}
              group={group}
              supplementGroups={supplementGroups}
              licenseTypes={licenseTypes}
              seasonId={seasonId}
            />
          ))}
          {standalone.map((supplement) => (
            <SupplementRow
              key={supplement.id}
              supplement={supplement}
              supplementGroups={supplementGroups}
              licenseTypes={licenseTypes}
              offer={{
                blocker: supplementBlockReason(supplement, lookups),
                offeredTypes: selectOfferedTypes(
                  supplement.typeLinks.map((link) => link.typeId),
                  licenseTypes,
                ),
              }}
              selectedTypeIds={supplement.typeLinks.map((link) => link.typeId)}
              seasonId={seasonId}
            />
          ))}
          <SupplementAddActions
            supplementGroups={supplementGroups}
            licenseTypes={licenseTypes}
            seasonId={seasonId}
          />
        </div>
      )}
    </div>
  );
}
