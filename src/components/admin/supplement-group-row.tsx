"use client";

import { buildAdminSellabilityLookups } from "@/helpers/admin-sellability-lookups";
import { groupBlockReason } from "@/helpers/group-block-reason";
import { selectOfferedTypes } from "@/helpers/offered-license-types";
import { retiredRowClass } from "@/helpers/retired-row-class";
import { cn } from "@/lib/utils";
import { PriceReadout } from "./price-readout";
import { GroupMemberList } from "./group-member-list";
import { StatusPill } from "./status-pill";
import { SupplementGroupActions } from "./supplement-group-actions";
import { SupplementOfferLine } from "./supplement-offer-line";
import type { SelectableLicenseType } from "./license-type-checklist";
import type { AdminSupplementGroup } from "@/types/admin-catalog";

type Props = {
  group: AdminSupplementGroup;
  supplementGroups: AdminSupplementGroup[];
  licenseTypes: SelectableLicenseType[];
  seasonId: string;
};

/**
 * One group with the supplements it sells inside it.
 *
 * The members are nested because the group owns their price and their
 * federations both: seeing them in here is what stops an admin looking for
 * those controls on a member, where they do not exist. The price and the
 * "se ofrece en" line are shown once, on the group, which is the only row
 * whose edit panel decides them.
 */
export function SupplementGroupRow({
  group,
  supplementGroups,
  licenseTypes,
  seasonId,
}: Props) {
  const seasonPrice = group.groupPrices[0]?.price;

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        retiredRowClass(group.active),
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-medium">{group.name}</span>
          <PriceReadout price={seasonPrice} />
          <StatusPill tone={group.active ? "positive" : "neutral"}>
            {group.active ? "Activo" : "Inactivo"}
          </StatusPill>
        </div>
        <SupplementGroupActions group={group} licenseTypes={licenseTypes} />
      </div>

      <SupplementOfferLine
        blocker={groupBlockReason(
          group,
          buildAdminSellabilityLookups([], [group]),
        )}
        offeredTypes={selectOfferedTypes(
          group.typeLinks.map((link) => link.typeId),
          licenseTypes,
        )}
      />

      <GroupMemberList
        groupId={group.id}
        supplements={group.supplements}
        supplementGroups={supplementGroups}
        licenseTypes={licenseTypes}
        seasonId={seasonId}
      />
    </div>
  );
}
