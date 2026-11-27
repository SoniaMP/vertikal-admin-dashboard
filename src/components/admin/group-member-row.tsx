"use client";

import { cn } from "@/lib/utils";
import { retiredRowClass } from "@/helpers/retired-row-class";
import { StatusPill } from "./status-pill";
import { SupplementActions } from "./supplement-actions";
import type { SelectableLicenseType } from "./license-type-checklist";
import type {
  AdminSupplement,
  AdminSupplementGroup,
} from "@/types/admin-catalog";

type Props = {
  supplement: AdminSupplement;
  supplementGroups: AdminSupplementGroup[];
  licenseTypes: SelectableLicenseType[];
};

/**
 * One supplement, shown inside the group that sells it.
 *
 * Deliberately barer than a standalone row: no price, because the group's is
 * the only one that counts, and no "se ofrece en" line, because the group's
 * sits a few pixels above and repeating it here is what made an admin reach
 * for a control that was never theirs. Being nested is the whole explanation.
 *
 * It keeps its own edit and its own retire: the name, the description and
 * whether this one member is still sold are its business, not the group's.
 */
export function GroupMemberRow({
  supplement,
  supplementGroups,
  licenseTypes,
}: Props) {
  return (
    <div
      className={cn(
        "-mx-1 flex items-center justify-between gap-3 rounded-sm px-1 py-1.5",
        retiredRowClass(supplement.active),
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate">{supplement.name}</span>
        {/* Both states, as every other row in this panel shows them. A bare
            "Inactivo" would read quieter here, but a list that labels state
            differently from the list above it costs more than it saves. */}
        <StatusPill tone={supplement.active ? "positive" : "neutral"}>
          {supplement.active ? "Activo" : "Inactivo"}
        </StatusPill>
      </div>
      <SupplementActions
        supplement={supplement}
        supplementGroups={supplementGroups}
        licenseTypes={licenseTypes}
        selectedTypeIds={[]}
        soldCount={supplement._count.membershipSupplements}
      />
    </div>
  );
}
