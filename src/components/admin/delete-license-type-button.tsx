"use client";

import { useTransition } from "react";
import { DeleteRowAction } from "./delete-row-action";
import { deleteLicenseType } from "@/app/admin/(dashboard)/tipos-federacion/actions";

type Props = {
  licenseTypeId: string;
  name: string;
  hasMemberships: boolean;
};

/**
 * Deletes a federation for good, with its modalities and prices.
 *
 * Only ever offered for a year still open, and never once somebody has been
 * registered under it — that row is what a member paid for.
 */
export function DeleteLicenseTypeButton({
  licenseTypeId,
  name,
  hasMemberships,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteLicenseType(licenseTypeId);
    });
  }

  return (
    <DeleteRowAction
      name={name}
      onConfirm={handleDelete}
      disabled={isPending || hasMemberships}
      reason={
        hasMemberships
          ? "No se puede eliminar: tiene registros asociados"
          : undefined
      }
    >
      Esta acción eliminará permanentemente el tipo de federativa y todos sus
      subtipos y precios asociados.
    </DeleteRowAction>
  );
}
