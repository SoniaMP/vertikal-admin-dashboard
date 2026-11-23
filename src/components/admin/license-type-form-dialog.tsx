"use client";

import { useState, useTransition, type FormEvent } from "react";
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
import { PropagationPrompt } from "./propagation-prompt";
import type { PropagationRequest } from "@/types/catalog-propagation";

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

  const editedId = licenseType?.id;

  const [error, setError] = useState<string>();
  const [propagation, setPropagation] = useState<PropagationRequest | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    setError(undefined);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await action(INITIAL_STATE, formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      // The edit is saved, and only in the year on screen. Whether it should
      // also reach the other open seasons is a separate question, asked after
      // the fact so that saying nothing leaves the other years alone.
      if (editedId) {
        setPropagation({ model: "licenseType", id: editedId, scope: "texts" });
      }
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? "Editar tipo de federativa"
                : "Nuevo tipo de federativa"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {error && (
              <p className="text-sm text-destructive">{error}</p>
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
      <PropagationPrompt
        request={propagation}
        entityLabel="esta federativa"
        onDone={() => setPropagation(null)}
      />
    </>
  );
}
