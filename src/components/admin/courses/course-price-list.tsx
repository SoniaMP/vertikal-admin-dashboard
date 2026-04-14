"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PriceRow = {
  id?: string;
  name: string;
  amountCents: number;
};

type InternalRow = {
  id?: string;
  name: string;
  eurosValue: string;
};

type Props = {
  defaultPrices?: PriceRow[];
  onChange: (prices: PriceRow[]) => void;
};

function centsToEuros(cents: number): string {
  return cents ? (cents / 100).toFixed(2) : "";
}

function eurosToCents(euros: string): number {
  const num = parseFloat(euros);
  return Number.isNaN(num) ? 0 : Math.round(num * 100);
}

function toInternal(rows: PriceRow[]): InternalRow[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    eurosValue: centsToEuros(r.amountCents),
  }));
}

function toExternal(rows: InternalRow[]): PriceRow[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amountCents: eurosToCents(r.eurosValue),
  }));
}

export function CoursePriceList({ defaultPrices = [], onChange }: Props) {
  const [rows, setRows] = useState<InternalRow[]>(toInternal(defaultPrices));

  function update(next: InternalRow[]) {
    setRows(next);
    onChange(toExternal(next));
  }

  function addRow() {
    update([...rows, { name: "", eurosValue: "" }]);
  }

  function removeRow(index: number) {
    update(rows.filter((_, i) => i !== index));
  }

  function updateField(
    index: number,
    field: "name" | "eurosValue",
    value: string,
  ) {
    const next = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    update(next);
  }

  return (
    <div className="space-y-2">
      <Label>Precios</Label>
      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay precios configurados.
        </p>
      )}
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={row.id ?? i} className="flex items-center gap-2">
            <Input
              placeholder="Nombre (ej: General)"
              value={row.name}
              onChange={(e) => updateField(i, "name", e.target.value)}
              className="flex-1"
            />
            <div className="relative w-28">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={row.eurosValue}
                onChange={(e) =>
                  updateField(i, "eurosValue", e.target.value)
                }
                className="pr-7"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                €
              </span>
            </div>
            <Button
              type="button"
              variant="ghost-destructive"
              size="icon-xs"
              onClick={() => removeRow(i)}
              aria-label="Eliminar precio"
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
      >
        <Plus className="h-4 w-4" />
        Añadir precio
      </Button>
    </div>
  );
}
