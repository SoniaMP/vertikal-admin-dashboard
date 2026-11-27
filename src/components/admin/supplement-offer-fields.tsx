"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  /** What it costs today, in cents, or undefined when it has no price yet. */
  price: number | undefined;
};

/**
 * The part of the supplement form that decides how the extra is sold: in a
 * group, or at its own price in its own federations.
 *
 * Never both. A supplement inside a group answers for its group in price and
 * federations alike, so picking a group puts both fields away and says where
 * they moved to. Holding the group choice here is what lets the three agree,
 * and living inside the dialog content is what makes them start from the saved
 * row again every time the dialog opens.
 */
export function SupplementOfferFields({
  groups,
  licenseTypes,
  defaultGroupId,
  selectedTypeIds,
  price,
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
        <>
          <div className="space-y-2">
            <Label htmlFor="sup-price">Precio (€)</Label>
            <Input
              id="sup-price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={price === undefined ? "" : (price / 100).toFixed(2)}
              className="tabular-nums"
            />
          </div>
          <LicenseTypeChecklist
            types={licenseTypes}
            selectedTypeIds={selectedTypeIds}
          />
        </>
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
