"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFilterNavigation } from "@/hooks/use-filter-navigation";
import { PAYMENT_LABELS } from "./membership-status-badges";
import { SavedViewsSelector } from "./saved-views-selector";
import { SeasonSelector } from "./season-selector";

const PAYMENT_OPTIONS = Object.entries(PAYMENT_LABELS);

type Props = {
  years: number[];
  selectedYear: number;
  activeYear: number;
};

/**
 * Scope first, then the filters: the season decides which rows exist at all,
 * so it sits at the head of the row rather than beside the page's actions.
 * The membership state left this row for the tabs above it.
 */
export function MembershipsToolbar({ years, selectedYear, activeYear }: Props) {
  const { updateParam, updateParamDebounced, clearAll, searchParams } =
    useFilterNavigation();

  const hasFilters = Array.from(searchParams.keys()).some(
    (k) => !["year", "sortBy", "sortDir", "page"].includes(k),
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <SeasonSelector
        years={years}
        selectedYear={selectedYear}
        activeYear={activeYear}
      />

      <Input
        placeholder="Buscar por nombre, DNI o email..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => updateParamDebounced("search", e.target.value)}
        className="sm:w-64"
      />

      <Select
        value={searchParams.get("paymentStatus") ?? "all"}
        onValueChange={(v) => updateParam("paymentStatus", v)}
      >
        <SelectTrigger className="sm:w-44">
          <SelectValue placeholder="Estado de pago" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Pago: Todos</SelectItem>
          {PAYMENT_OPTIONS.map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("federated") ?? "all"}
        onValueChange={(v) => updateParam("federated", v)}
      >
        <SelectTrigger className="sm:w-36">
          <SelectValue placeholder="Federado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Federado: Todos</SelectItem>
          <SelectItem value="true">Sí</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>

      <SavedViewsSelector />

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
