"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFilterNavigation } from "@/hooks/use-filter-navigation";
import { PAYMENT_LABELS, STATUS_LABELS } from "./membership-status-badges";
import type { FilterOptions } from "@/lib/admin-queries";

const FILTER_LABELS: Record<string, string> = {
  search: "Búsqueda",
  paymentStatus: "Estado pago",
  membershipStatus: "Estado",
  federated: "Federado",
  sex: "Sexo",
  typeId: "Tipo",
  subtypeId: "Subtipo",
  categoryId: "Categoría",
  province: "Provincia",
  city: "Ciudad",
  dateFrom: "Desde",
  dateTo: "Hasta",
  view: "Vista",
};

const EXCLUDED_KEYS = new Set([
  // The season is the scope of the page, not a filter to clear.
  "year",
  "sortBy",
  "sortDir",
  "page",
]);

type Props = {
  filterOptions: FilterOptions;
};

export function ActiveFilterChips({ filterOptions }: Props) {
  const { searchParams, updateParam } = useFilterNavigation();

  const entries = Array.from(searchParams.entries()).filter(
    ([key, value]) => !EXCLUDED_KEYS.has(key) && value,
  );

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-label="Filtros activos">
      {entries.map(([key, value]) => (
        <Badge
          key={key}
          variant="secondary"
          className="cursor-pointer gap-1 pr-1"
          onClick={() => updateParam(key, "all")}
        >
          {FILTER_LABELS[key] ?? key}:{" "}
          {resolveDisplayValue(key, value, filterOptions)}
          <X
            className="h-3 w-3"
            aria-label={`Eliminar filtro ${FILTER_LABELS[key] ?? key}`}
          />
        </Badge>
      ))}
    </div>
  );
}

function resolveDisplayValue(
  key: string,
  value: string,
  options: FilterOptions,
): string {
  switch (key) {
    case "paymentStatus":
      return PAYMENT_LABELS[value] ?? value;
    case "membershipStatus":
      return STATUS_LABELS[value] ?? value;
    case "federated":
      return value === "true" ? "Sí" : "No";
    case "sex":
      return SEX_LABELS[value] ?? value;
    case "typeId":
      return options.types.find((t) => t.id === value)?.name ?? value;
    case "subtypeId":
      return options.subtypes.find((s) => s.id === value)?.name ?? value;
    case "categoryId":
      return options.categories.find((c) => c.id === value)?.name ?? value;
    case "view":
      return VIEW_LABELS[value] ?? value;
    default:
      return value;
  }
}

const SEX_LABELS: Record<string, string> = {
  M: "Hombre",
  F: "Mujer",
};

const VIEW_LABELS: Record<string, string> = {
  not_renewed: "No renovados",
  morosos: "Morosos",
  federados: "Federados",
};
