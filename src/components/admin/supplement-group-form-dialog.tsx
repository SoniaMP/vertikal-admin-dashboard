"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { SupplementGroup } from "@prisma/client";
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
  createSupplementGroup,
  updateSupplementGroup,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { PropagationPrompt } from "./propagation-prompt";
import type { PropagationRequest } from "@/types/catalog-propagation";
import {
  LicenseTypeChecklist,
  type SelectableLicenseType,
} from "./license-type-checklist";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonId: string;
  group?: SupplementGroup;
  licenseTypes: SelectableLicenseType[];
  /** The federations this group is offered in today. */
  selectedTypeIds: string[];
  /** What the group costs this season, in cents, if it has a price yet. */
  price?: number;
};

const INITIAL_STATE = { success: false, error: undefined };

export function SupplementGroupFormDialog({
  open,
  onOpenChange,
  seasonId,
  group,
  licenseTypes,
  selectedTypeIds,
  price,
}: Props) {
  const isEditing = !!group;

  const action = isEditing
    ? updateSupplementGroup.bind(null, group.id)
    : createSupplementGroup;

  const editedId = group?.id;

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
        setPropagation({
          model: "supplementGroup",
          id: editedId,
          scope: "texts",
        });
      }
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar grupo" : "Nuevo grupo de suplementos"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* The season owns the row: a new one belongs to the year on screen. */}
            <input type="hidden" name="seasonId" value={seasonId} />

            <div className="space-y-2">
              <Label htmlFor="grp-name">Nombre</Label>
              <Input
                id="grp-name"
                name="name"
                defaultValue={group?.name ?? ""}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grp-price">Precio (€)</Label>
              <Input
                id="grp-price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={
                  price === undefined ? "" : (price / 100).toFixed(2)
                }
                className="tabular-nums"
              />
            </div>
            {/* The group carries the federations for every supplement in
                it, the same way it carries their price. */}
            <LicenseTypeChecklist
              types={licenseTypes}
              selectedTypeIds={selectedTypeIds}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
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
        entityLabel="este grupo"
        onDone={() => setPropagation(null)}
      />
    </>
  );
}
