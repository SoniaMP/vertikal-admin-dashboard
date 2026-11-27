"use client";

import { useState, useTransition } from "react";
import { Pencil, Power } from "lucide-react";
import { DeleteRowAction } from "./delete-row-action";
import { RowActionButton } from "./row-action-button";
import { RowActions } from "./row-actions";
import {
  deleteSupplementGroup,
  toggleSupplementGroupActive,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { SupplementGroupFormDialog } from "./supplement-group-form-dialog";
import type { SelectableLicenseType } from "./license-type-checklist";
import type { AdminSupplementGroup } from "@/types/admin-catalog";

type Props = {
  group: AdminSupplementGroup;
  licenseTypes: SelectableLicenseType[];
};

/**
 * Edit, retire or delete a group.
 *
 * The same three a supplement has, in the same order, because they sit in the
 * same list now and an admin should not have to learn which row offers what.
 * Deleting asks first and says what happens to the members, which is the part
 * nobody expects: they survive the group and come out unpriced.
 */
export function SupplementGroupActions({ group, licenseTypes }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleSupplementGroupActive(group.id, !group.active);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSupplementGroup(group.id);
    });
  }

  return (
    <RowActions>
      <RowActionButton
        onClick={() => setIsEditOpen(true)}
        disabled={!group.active}
        aria-label="Editar grupo"
        title={
          group.active
            ? "Editar"
            : "Está inactivo: actívalo para poder editarlo"
        }
      >
        <Pencil />
      </RowActionButton>
      <RowActionButton
        onClick={handleToggle}
        disabled={isPending}
        aria-label={group.active ? "Desactivar" : "Activar"}
      >
        <Power />
      </RowActionButton>
      <DeleteRowAction
        name={group.name}
        onConfirm={handleDelete}
        disabled={isPending}
      >
        Se borra para siempre, con su precio y sus federativas. Sus{" "}
        {group.supplements.length} suplementos no se borran: se quedan sueltos y
        sin precio, así que dejarán de venderse hasta que les pongas uno. Para
        dejar de vender el grupo sin deshacerlo, desactívalo.
      </DeleteRowAction>
      <SupplementGroupFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        seasonId={group.seasonId}
        group={group}
        licenseTypes={licenseTypes}
        selectedTypeIds={group.typeLinks.map((link) => link.typeId)}
        price={group.groupPrices[0]?.price}
      />
    </RowActions>
  );
}
