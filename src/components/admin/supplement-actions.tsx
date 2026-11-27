"use client";

import { useState, useTransition } from "react";
import type { Supplement } from "@prisma/client";
import { Pencil, Power } from "lucide-react";
import { DeleteRowAction } from "./delete-row-action";
import { RowActionButton } from "./row-action-button";
import { RowActions } from "./row-actions";
import {
  deleteSupplement,
  toggleSupplementActive,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { SupplementFormDialog } from "./supplement-form-dialog";
import type { SelectableLicenseType } from "./license-type-checklist";
import type { AdminSupplementGroup } from "@/types/admin-catalog";

type Props = {
  supplement: Supplement;
  supplementGroups: AdminSupplementGroup[];
  licenseTypes: SelectableLicenseType[];
  selectedTypeIds: string[];
  /** Its own price this season, in cents; a grouped one has none. */
  price?: number;
  /** How many memberships already bought it; above zero it cannot be deleted. */
  soldCount: number;
};

export function SupplementActions({
  supplement,
  supplementGroups,
  licenseTypes,
  selectedTypeIds,
  price,
  soldCount,
}: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleSupplementActive(supplement.id, !supplement.active);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSupplement(supplement.id);
    });
  }

  const isSold = soldCount > 0;

  return (
    <RowActions>
      <RowActionButton
        onClick={() => setIsEditOpen(true)}
        disabled={!supplement.active}
        aria-label="Editar suplemento"
        title={
          supplement.active
            ? "Editar"
            : "Está inactivo: actívalo para poder editarlo"
        }
      >
        <Pencil />
      </RowActionButton>
      <RowActionButton
        onClick={handleToggle}
        disabled={isPending}
        aria-label={supplement.active ? "Desactivar" : "Activar"}
      >
        <Power />
      </RowActionButton>
      <DeleteRowAction
        name={supplement.name}
        onConfirm={handleDelete}
        disabled={isPending || isSold}
        reason={
          isSold
            ? "No se puede eliminar: hay membresías que lo incluyen"
            : undefined
        }
      >
        Se borra para siempre, junto con su precio de esta temporada y las
        federativas en las que se ofrecía. Para dejar de venderlo sin perderlo,
        desactívalo.
      </DeleteRowAction>
      <SupplementFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        seasonId={supplement.seasonId}
        supplement={supplement}
        supplementGroups={supplementGroups}
        licenseTypes={licenseTypes}
        selectedTypeIds={selectedTypeIds}
        price={price}
      />
    </RowActions>
  );
}
