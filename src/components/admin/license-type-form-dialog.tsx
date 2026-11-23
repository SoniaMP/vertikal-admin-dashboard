"use client";

import { useActionState, useEffect } from "react";
import type { LicenseType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createLicenseType,
  updateLicenseType,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonId: string;
  licenseType?: LicenseType;
};

const INITIAL_STATE = { success: false, error: undefined };

export function LicenseTypeFormDialog({
  open,
  onOpenChange,
  seasonId,
  licenseType,
}: Props) {
  const isEditing = !!licenseType;

  const action = isEditing
    ? updateLicenseType.bind(null, licenseType.id)
    : createLicenseType;

  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar tipo de federativa"
              : "Nuevo tipo de federativa"}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {/* The season owns the row: a new one belongs to the year on screen. */}
          <input type="hidden" name="seasonId" value={seasonId} />

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={licenseType?.name ?? ""}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              name="description"
              defaultValue={licenseType?.description ?? ""}
              required
              minLength={5}
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
