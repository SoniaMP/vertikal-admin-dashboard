"use client";

import { type FormEvent, useState, useTransition } from "react";
import type { LicenseOffering } from "@prisma/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { batchUpsertOfferings } from "@/app/admin/(dashboard)/tipos-federacion/actions";
import type {
  CategoryWithCount,
  SubtypeWithCount,
} from "./license-types-table";

type Props = {
  seasonId: string;
  typeId: string;
  categories: CategoryWithCount[];
  subtypes: SubtypeWithCount[];
  offerings: LicenseOffering[];
};

export function OfferingMatrixSection({
  seasonId,
  typeId,
  categories,
  subtypes,
  offerings,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Precios por categoría ({categories.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {categories.length === 0 || subtypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {categories.length === 0
                ? "Añade categorías primero."
                : "Añade subtipos para configurar precios."}
            </p>
          ) : (
            <PriceTable
              seasonId={seasonId}
              typeId={typeId}
              categories={categories}
              subtypes={subtypes}
              offerings={offerings}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PriceTable({
  seasonId,
  typeId,
  categories,
  subtypes,
  offerings,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    const fd = new FormData(e.currentTarget);
    const entries = buildEntries(fd, categories, subtypes);

    startTransition(async () => {
      const result = await batchUpsertOfferings(seasonId, typeId, entries);
      if (!result.success) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 pr-3 font-medium">Categoría</th>
              {subtypes.map((s) => (
                <th
                  key={s.id}
                  className="pb-2 px-2 font-medium text-center min-w-[100px]"
                >
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <PriceRow
                key={cat.id}
                category={cat}
                subtypes={subtypes}
                offerings={offerings}
              />
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button size="sm" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar precios"}
      </Button>
    </form>
  );
}

function PriceRow({
  category,
  subtypes,
  offerings,
}: {
  category: CategoryWithCount;
  subtypes: SubtypeWithCount[];
  offerings: LicenseOffering[];
}) {
  const getDefault = (subtypeId: string) => {
    const offering = offerings.find(
      (o) => o.categoryId === category.id && o.subtypeId === subtypeId,
    );
    return offering ? (offering.price / 100).toFixed(2) : "";
  };

  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-3">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{category.name}</span>
          <Badge
            variant={category.active ? "default" : "secondary"}
            className="text-xs"
          >
            {category.active ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </td>
      {subtypes.map((sub) => (
        <td key={sub.id} className="py-2 px-2">
          <Input
            name={`price-${category.id}-${sub.id}`}
            type="number"
            step="0.01"
            min="0"
            defaultValue={getDefault(sub.id)}
            placeholder="€"
            className="h-8 w-24 text-center"
          />
        </td>
      ))}
    </tr>
  );
}

function buildEntries(
  fd: FormData,
  categories: CategoryWithCount[],
  subtypes: SubtypeWithCount[],
) {
  const entries: {
    categoryId: string;
    subtypeId: string;
    price: number | null;
  }[] = [];
  for (const cat of categories) {
    for (const sub of subtypes) {
      const raw = fd.get(`price-${cat.id}-${sub.id}`) as string;
      const num = parseFloat(raw);
      const price =
        raw && !isNaN(num) && num > 0 ? Math.round(num * 100) : null;
      entries.push({ categoryId: cat.id, subtypeId: sub.id, price });
    }
  }
  return entries;
}
