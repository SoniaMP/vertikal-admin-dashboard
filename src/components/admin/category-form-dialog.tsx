"use client";

import { useActionState, useEffect } from "react";
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

  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={(e) => e.stopPropagation()}
          className="space-y-4"
        >
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
