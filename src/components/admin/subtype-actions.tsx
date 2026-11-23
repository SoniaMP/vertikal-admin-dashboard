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
import { PropagationPrompt } from "./propagation-prompt";
import type { PropagationRequest } from "@/types/catalog-propagation";
import { SubtypeFormDialog } from "./subtype-form-dialog";
import { resolveLicenseVisibility } from "@/helpers/license-visibility";

type Props = {
  subtype: LicenseSubtype;
  membershipCount: number;
};

export function SubtypeActions({ subtype, membershipCount }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [propagation, setPropagation] = useState<PropagationRequest | null>(
    null,
  );

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleSubtypeActive(subtype.id, !subtype.active);
      // Retiring something in one year says nothing about the others, so the
      // change stops here unless the admin says otherwise.
      if (result.success) {
        setPropagation({ model: "licenseSubtype", id: subtype.id, scope: "state" });
      }
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
      {/* A draft is already invisible to members, so there is nothing to
          deactivate until it has been published. */}
      {!isDraft && (
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
      )}
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
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
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
      <PropagationPrompt
        request={propagation}
        entityLabel="esta modalidad"
        onDone={() => setPropagation(null)}
      />
    </div>
  );
}
