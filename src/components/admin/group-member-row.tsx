"use client";

import type { Supplement, SupplementGroup } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { SupplementActions } from "./supplement-actions";
import type { SelectableLicenseType } from "./license-type-checklist";

type SupplementGroupWithSupplements = SupplementGroup & {
  supplements: Supplement[];
};

type Props = {
  supplement: Supplement;
  supplementGroups: SupplementGroupWithSupplements[];
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
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate">{supplement.name}</span>
        {/* Both states, as every other row in this panel shows them. A bare
            "Inactivo" would read quieter here, but a list that labels state
            differently from the list above it costs more than it saves. */}
        <Badge variant={supplement.active ? "default" : "secondary"}>
          {supplement.active ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      <SupplementActions
        supplement={supplement}
        supplementGroups={supplementGroups}
        licenseTypes={licenseTypes}
        selectedTypeIds={[]}
      />
    </div>
  );
}
