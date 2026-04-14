"use client";

import { useState, useTransition } from "react";
import type {
  SupplementGroup,
  Supplement,
  SupplementGroupPrice,
} from "@prisma/client";
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteSupplementGroup,
  upsertSupplementGroupPrice,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { SupplementGroupFormDialog } from "./supplement-group-form-dialog";

type SupplementGroupWithPrices = SupplementGroup & {
  supplements: Supplement[];
  groupPrices: SupplementGroupPrice[];
};

type Props = {
  supplementGroups: SupplementGroupWithPrices[];
  seasonId: string;
};

export function SupplementGroupsSection({
  supplementGroups,
  seasonId,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="rounded-lg border px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Grupos de suplementos ({supplementGroups.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {supplementGroups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin grupos todavía.
            </p>
          )}
          {supplementGroups.map((grp) => (
            <GroupRow key={grp.id} group={grp} seasonId={seasonId} />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="mt-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Añadir grupo
          </Button>
          <SupplementGroupFormDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
          />
        </div>
      )}
    </div>
  );
}

function GroupRow({
  group,
  seasonId,
}: {
  group: SupplementGroupWithPrices;
  seasonId: string;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const seasonPrice = group.groupPrices[0]?.price;

  function handleDelete() {
    startTransition(async () => {
      await deleteSupplementGroup(group.id);
    });
  }

  function handlePriceSave(value: string) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    const cents = Math.round(num * 100);
    startTransition(async () => {
      await upsertSupplementGroupPrice(group.id, seasonId, cents);
    });
  }

  return (
    <div className="rounded-md border px-3 py-2 text-sm space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium truncate">{group.name}</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            defaultValue={seasonPrice ? (seasonPrice / 100).toFixed(2) : ""}
            placeholder="€"
            className="h-7 w-20 text-center text-xs"
            disabled={isPending}
            onBlur={(e) => handlePriceSave(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost-info"
            size="icon"
            onClick={() => setIsEditOpen(true)}
            aria-label="Editar grupo"
            className="h-7 w-7"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost-destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Eliminar grupo"
            className="h-7 w-7"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {group.supplements.length > 0 && (
        <p className="text-xs text-muted-foreground pl-1">
          Suplementos: {group.supplements.map((s) => s.name).join(", ")}
        </p>
      )}
      <SupplementGroupFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        group={group}
      />
    </div>
  );
}
