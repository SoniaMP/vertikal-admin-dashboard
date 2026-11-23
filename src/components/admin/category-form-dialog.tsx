"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { Category } from "@prisma/client";
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
  createCategory,
  updateCategory,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { PropagationPrompt } from "./propagation-prompt";
import type { PropagationRequest } from "@/types/catalog-propagation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonId: string;
  category?: Category;
};

const INITIAL_STATE = { success: false, error: undefined };

export function CategoryFormDialog({
  open,
  onOpenChange,
  seasonId,
  category,
}: Props) {
  const isEditing = !!category;

  const action = isEditing
    ? updateCategory.bind(null, category.id)
    : createCategory;

  const editedId = category?.id;

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
        setPropagation({ model: "category", id: editedId, scope: "texts" });
      }
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* The season owns the row: a new one belongs to the year on screen. */}
            <input type="hidden" name="seasonId" value={seasonId} />
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                name="name"
                defaultValue={category?.name ?? ""}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-description">Descripción</Label>
              <Input
                id="cat-description"
                name="description"
                defaultValue={category?.description ?? ""}
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
        entityLabel="esta categoría"
        onDone={() => setPropagation(null)}
      />
    </>
  );
}
