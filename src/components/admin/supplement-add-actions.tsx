"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplementFormDialog } from "./supplement-form-dialog";
import { SupplementGroupFormDialog } from "./supplement-group-form-dialog";
import type { SelectableLicenseType } from "./license-type-checklist";
import type { AdminSupplementGroup } from "@/types/admin-catalog";

type Props = {
  supplementGroups: AdminSupplementGroup[];
  licenseTypes: SelectableLicenseType[];
  seasonId: string;
};

/**
 * The two things an admin can create here.
 *
 * "Nuevo", not "Añadir": these make a row that did not exist, while the
 * "Añadir suplemento" inside a group puts one into that group. The verb is
 * what tells the two apart, so neither button has to name a place.
 *
 * Both are spelled out rather than hidden behind one menu: with exactly two
 * choices, two buttons explain themselves and the common one — a standalone
 * extra — stays a single click.
 */
export function SupplementAddActions({
  supplementGroups,
  licenseTypes,
  seasonId,
}: Props) {
  const [isSupplementOpen, setIsSupplementOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsSupplementOpen(true)}
      >
        <Plus className="mr-1 h-3 w-3" />
        Nuevo suplemento
      </Button>
      <Button variant="outline" size="sm" onClick={() => setIsGroupOpen(true)}>
        <Plus className="mr-1 h-3 w-3" />
        Nuevo grupo
      </Button>
      <SupplementFormDialog
        open={isSupplementOpen}
        onOpenChange={setIsSupplementOpen}
        seasonId={seasonId}
        supplementGroups={supplementGroups}
        licenseTypes={licenseTypes}
        selectedTypeIds={[]}
      />
      <SupplementGroupFormDialog
        open={isGroupOpen}
        onOpenChange={setIsGroupOpen}
        seasonId={seasonId}
        licenseTypes={licenseTypes}
        selectedTypeIds={[]}
      />
    </div>
  );
}
