"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending || hasMemberships}
          aria-label="Eliminar"
          title={
            hasMemberships
              ? "No se puede eliminar: tiene registros asociados"
              : "Eliminar"
          }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar &ldquo;{name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el tipo de federativa y todos
            sus subtipos y precios asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
