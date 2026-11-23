"use client";

import { useState, useTransition } from "react";
import type {
  Supplement,
  SupplementGroup,
  SupplementPrice,
} from "@prisma/client";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { upsertSupplementPrice } from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { SupplementActions } from "./supplement-actions";
import { SupplementFormDialog } from "./supplement-form-dialog";

type SupplementWithPrice = Supplement & {
  supplementGroup: SupplementGroup | null;
  prices: SupplementPrice[];
};

type SupplementGroupWithSupplements = SupplementGroup & {
  supplements: Supplement[];
};

type Props = {
  supplements: SupplementWithPrice[];
  supplementGroups: SupplementGroupWithSupplements[];
  seasonId: string;
};

export function SupplementsSection({
  supplements,
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
        <span>Suplementos ({supplements.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {supplements.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin suplementos todavía.
            </p>
          )}
          {supplements.map((sup) => (
            <SupplementRow
              key={sup.id}
              supplement={sup}
              supplementGroups={supplementGroups}
              seasonId={seasonId}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="mt-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Añadir suplemento
          </Button>
          <SupplementFormDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            seasonId={seasonId}
            supplementGroups={supplementGroups}
          />
        </div>
      )}
    </div>
  );
}

function SupplementRow({
  supplement,
  supplementGroups,
  seasonId,
}: {
  supplement: SupplementWithPrice;
  supplementGroups: SupplementGroupWithSupplements[];
  seasonId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const seasonPrice = supplement.prices[0]?.price;
  const hasGroup = !!supplement.supplementGroup;

  function handlePriceSave(value: string) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    const cents = Math.round(num * 100);
    startTransition(async () => {
      await upsertSupplementPrice(supplement.id, seasonId, cents);
    });
  }

  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-medium truncate">{supplement.name}</span>
        {hasGroup && (
          <Badge variant="outline">
            Grupo: {supplement.supplementGroup!.name}
          </Badge>
        )}
        {!hasGroup && (
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
        )}
        <Badge variant={supplement.active ? "default" : "secondary"}>
          {supplement.active ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      <SupplementActions
        supplement={supplement}
        supplementGroups={supplementGroups}
      />
    </div>
  );
}
