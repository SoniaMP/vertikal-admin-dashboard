"use client";

import { useActionState, useEffect, useState } from "react";
import type { Supplement, SupplementGroup } from "@prisma/client";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSupplement,
  updateSupplement,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";

type SupplementGroupWithSupplements = SupplementGroup & {
  supplements: Supplement[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonId: string;
  supplement?: Supplement;
  supplementGroups?: SupplementGroupWithSupplements[];
};

const INITIAL_STATE = { success: false, error: undefined };
const NO_GROUP = "__none__";

export function SupplementFormDialog({
  open,
  onOpenChange,
  seasonId,
  supplement,
  supplementGroups = [],
}: Props) {
  const isEditing = !!supplement;
  const [selectedGroup, setSelectedGroup] = useState(
    supplement?.supplementGroupId ?? NO_GROUP,
  );
  const [prevOpen, setPrevOpen] = useState(open);

  if (open && !prevOpen) {
    setSelectedGroup(supplement?.supplementGroupId ?? NO_GROUP);
    setPrevOpen(true);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const action = isEditing
    ? updateSupplement.bind(null, supplement.id)
    : createSupplement;

  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar suplemento" : "Nuevo suplemento"}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {/* The season owns the row: a new one belongs to the year on screen. */}
          <input type="hidden" name="seasonId" value={seasonId} />

          <div className="space-y-2">
            <Label htmlFor="sup-name">Nombre</Label>
            <Input
              id="sup-name"
              name="name"
              defaultValue={supplement?.name ?? ""}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sup-description">Descripción</Label>
            <Input
              id="sup-description"
              name="description"
              defaultValue={supplement?.description ?? ""}
              required
              minLength={5}
            />
          </div>
          {supplementGroups.length > 0 && (
            <div className="space-y-2">
              <Label>Grupo (opcional)</Label>
              <input
                type="hidden"
                name="supplementGroupId"
                value={selectedGroup !== NO_GROUP ? selectedGroup : ""}
              />
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GROUP}>Sin grupo</SelectItem>
                  {supplementGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
