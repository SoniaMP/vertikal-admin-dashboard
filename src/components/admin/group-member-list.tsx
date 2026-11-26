"use client";

import { useState } from "react";
import type { Supplement, SupplementGroup } from "@prisma/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupMemberRow } from "./group-member-row";
import { SupplementFormDialog } from "./supplement-form-dialog";
import type { SelectableLicenseType } from "./license-type-checklist";

type SupplementGroupWithSupplements = SupplementGroup & {
  supplements: Supplement[];
};

type Props = {
  groupId: string;
  supplements: Supplement[];
  supplementGroups: SupplementGroupWithSupplements[];
  licenseTypes: SelectableLicenseType[];
  seasonId: string;
};

/**
 * The supplements a group sells, listed inside it.
 *
 * Nothing here explains that the members take the group's price and
 * federations: being nested is that explanation, and a sentence saying it
 * would be an admission the layout does not hold on its own. An empty group
 * says nothing either — the line above it already reads "No se vende · sin
 * suplementos", and the button below is the fix.
 *
 * "Añadir" rather than "Nuevo", and the group is already chosen: the verb says
 * this puts a supplement into something, where the section footer's "Nuevo"
 * creates one from scratch.
 */
export function GroupMemberList({
  groupId,
  supplements,
  supplementGroups,
  licenseTypes,
  seasonId,
}: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="mt-2 border-t pt-2">
      <div className="divide-y">
        {supplements.map((supplement) => (
          <GroupMemberRow
            key={supplement.id}
            supplement={supplement}
            supplementGroups={supplementGroups}
            licenseTypes={licenseTypes}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsAddOpen(true)}
        className="mt-1 h-7 px-2 text-xs text-muted-foreground"
      >
        <Plus className="mr-1 h-3 w-3" />
        Añadir suplemento
      </Button>
      <SupplementFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        seasonId={seasonId}
        supplementGroups={supplementGroups}
        licenseTypes={licenseTypes}
        selectedTypeIds={[]}
        defaultGroupId={groupId}
      />
    </div>
  );
}
