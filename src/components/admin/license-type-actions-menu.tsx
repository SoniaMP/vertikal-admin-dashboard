"use client";

import { useState, useTransition } from "react";
import { Eye, Pencil, Power, Trash2 } from "lucide-react";
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
  toggleLicenseTypeActive,
  deleteLicenseType,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { LicenseTypeFormDialog } from "./license-type-form-dialog";
import { LicensePreviewDialog } from "./license-preview-dialog";
import { resolveLicenseVisibility } from "@/helpers/license-visibility";
import type {
  LicenseTypeWithRelations,
  CategoryWithCount,
} from "./license-types-table";

type Props = {
  licenseType: LicenseTypeWithRelations;
  membershipCount: number;
  categories: CategoryWithCount[];
  seasonName: string;
};

export function LicenseTypeActions({
  licenseType,
  membershipCount,
  categories,
  seasonName,
}: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isDraft = resolveLicenseVisibility(licenseType) === "draft";

  function handleToggle() {
    startTransition(async () => {
      await toggleLicenseTypeActive(licenseType.id, !licenseType.active);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteLicenseType(licenseType.id);
    });
  }

  const hasMemberships = membershipCount > 0;

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsPreviewOpen(true)}
        aria-label={isDraft ? "Previsualizar y publicar" : "Previsualizar"}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost-info"
        size="icon"
        onClick={() => setIsEditOpen(true)}
        aria-label="Editar"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {/* Activating a draft changes nothing a member can see, so the toggle
          only shows up once the type has been published. */}
      {!isDraft && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          disabled={isPending}
          aria-label={licenseType.active ? "Desactivar" : "Activar"}
        >
          <Power className="h-4 w-4" />
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost-destructive"
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
            <AlertDialogTitle>
              ¿Eliminar &ldquo;{licenseType.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el tipo de federativa y todos
              sus subtipos y precios asociados.
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
      <LicenseTypeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        licenseType={licenseType}
      />
      <LicensePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        licenseType={licenseType}
        categories={categories}
        seasonName={seasonName}
      />
    </div>
  );
}
