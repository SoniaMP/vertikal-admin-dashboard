"use client";

import { useState, useTransition } from "react";
import type { LicenseSubtype } from "@prisma/client";
import { Pencil, Power, Trash2 } from "lucide-react";
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
import {
  toggleSubtypeActive,
  deleteSubtype,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { SubtypeFormDialog } from "./subtype-form-dialog";

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

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost-info"
        size="icon"
        onClick={() => setIsEditOpen(true)}
        aria-label="Editar subtipo"
        className="h-7 w-7"
      >
        <Pencil className="h-3 w-3" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={subtype.active ? "Desactivar" : "Activar"}
        className="h-7 w-7"
      >
        <Power className="h-3 w-3" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost-destructive"
            size="icon"
            disabled={isPending || hasMemberships}
            aria-label="Eliminar subtipo"
            title={
              hasMemberships
                ? "No se puede eliminar: tiene registros asociados"
                : "Eliminar"
            }
            className="h-7 w-7"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar &ldquo;{subtype.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el subtipo y sus precios
              asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SubtypeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        licenseTypeId={subtype.licenseTypeId}
        subtype={subtype}
      />
    </div>
  );
}
