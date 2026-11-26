"use client";

import { useState } from "react";
import { SupplementGroupPicker } from "./supplement-group-picker";
import {
  LicenseTypeChecklist,
  type SelectableLicenseType,
} from "./license-type-checklist";

const NO_GROUP = "";

type Props = {
  groups: { id: string; name: string }[];
  licenseTypes: SelectableLicenseType[];
  defaultGroupId: string | null;
  selectedTypeIds: string[];
};

/**
 * The part of the supplement form that decides where the extra is sold: its
 * group, or the federations it is offered in.
 *
 * Never both. A supplement inside a group answers for its group in price and
 * federations alike, so picking a group puts the federation list away and says
 * where it moved to. Holding the group choice here is what lets the two fields
 * agree, and living inside the dialog content is what makes both of them start
 * from the saved row again every time the dialog opens.
 */
export function SupplementOfferFields({
  groups,
  licenseTypes,
  defaultGroupId,
  selectedTypeIds,
}: Props) {
  const [groupId, setGroupId] = useState(defaultGroupId ?? NO_GROUP);
  const groupName = groups.find((group) => group.id === groupId)?.name;

  return (
    <>
      <SupplementGroupPicker
        groups={groups}
        value={groupId}
        onValueChange={setGroupId}
      />
      {groupId === NO_GROUP ? (
        <LicenseTypeChecklist
          types={licenseTypes}
          selectedTypeIds={selectedTypeIds}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Se ofrece donde se ofrezca el grupo
          {groupName ? ` ${groupName}` : ""}, igual que su precio. Las
          federativas se eligen en el grupo.
        </p>
      )}
    </>
  );
}
