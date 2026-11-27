"use client";

import { useState, useTransition } from "react";
import type { LicenseSubtype } from "@prisma/client";
import { Pencil, Power } from "lucide-react";
import { DeleteRowAction } from "./delete-row-action";
import { RowActionButton } from "./row-action-button";
import { RowActions } from "./row-actions";
import {
  toggleSubtypeActive,
  deleteSubtype,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { SubtypeFormDialog } from "./subtype-form-dialog";
import { resolveLicenseVisibility } from "@/helpers/license-visibility";

type Props = {
  subtype: LicenseSubtype;
  membershipCount: number;
};

export function SubtypeActions({ subtype, membershipCount }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleSubtypeActive(subtype.id, !subtype.active);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSubtype(subtype.id);
    });
  }

  const hasMemberships = membershipCount > 0;
  const isDraft = resolveLicenseVisibility(subtype) === "draft";

  return (
    <RowActions>
      <RowActionButton
        onClick={() => setIsEditOpen(true)}
        aria-label="Editar subtipo"
      >
        <Pencil />
      </RowActionButton>
      {/* A draft is already invisible to members, so there is nothing to
          deactivate until it has been published. */}
      {!isDraft && (
        <RowActionButton
          onClick={handleToggle}
          disabled={isPending}
          aria-label={subtype.active ? "Desactivar" : "Activar"}
        >
          <Power />
        </RowActionButton>
      )}
      <DeleteRowAction
        name={subtype.name}
        onConfirm={handleDelete}
        disabled={isPending || hasMemberships}
        reason={
          hasMemberships
            ? "No se puede eliminar: tiene registros asociados"
            : undefined
        }
      >
        Esta acción eliminará permanentemente el subtipo y sus precios
        asociados.
      </DeleteRowAction>
      <SubtypeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        licenseTypeId={subtype.licenseTypeId}
        subtype={subtype}
      />
    </RowActions>
  );
}
