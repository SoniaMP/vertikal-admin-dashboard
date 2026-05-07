"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useFilterNavigation } from "@/hooks/use-filter-navigation";
import type { FilterOptions } from "@/lib/admin-queries";

type Props = {
  filterOptions: FilterOptions;
};

export function AdvancedFiltersPanel({ filterOptions }: Props) {
  const { searchParams, updateParam, clearAll } = useFilterNavigation();
  const [isOpen, setIsOpen] = useState(false);

  const typeId = searchParams.get("typeId") ?? "";
  const subtypeId = searchParams.get("subtypeId") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const sex = searchParams.get("sex") ?? "";

  const filteredSubtypes = typeId
    ? filterOptions.subtypes.filter((s) => s.typeId === typeId)
    : filterOptions.subtypes;

  const hasAdvancedFilters = [
    "typeId",
    "subtypeId",
    "categoryId",
    "sex",
    "province",
    "city",
    "dateFrom",
    "dateTo",
  ].some((key) => searchParams.has(key));

  const sexOptions = [
    { id: "M", name: "Hombre" },
    { id: "F", name: "Mujer" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          Filtros avanzados
          {hasAdvancedFilters && (
            <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 text-xs">
              !
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <FilterSelect
            label="Tipo"
            value={typeId}
            options={filterOptions.types}
            onChange={(v) => {
              updateParam("typeId", v);
              if (v === "all") updateParam("subtypeId", "all");
            }}
          />

          <FilterSelect
            label="Subtipo"
            value={subtypeId}
            options={filteredSubtypes}
            onChange={(v) => updateParam("subtypeId", v)}
          />

          <FilterSelect
            label="Categoría"
            value={categoryId}
            options={filterOptions.categories}
            onChange={(v) => updateParam("categoryId", v)}
          />

          <FilterSelect
            label="Sexo"
            value={sex}
            options={sexOptions}
            onChange={(v) => updateParam("sex", v)}
          />

          <div className="space-y-1.5">
            <Label className="text-sm">Provincia</Label>
            <Input
              placeholder="Provincia..."
              defaultValue={searchParams.get("province") ?? ""}
              onChange={(e) => updateParam("province", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Ciudad</Label>
            <Input
              placeholder="Ciudad..."
              defaultValue={searchParams.get("city") ?? ""}
              onChange={(e) => updateParam("city", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Desde</Label>
            <Input
              type="date"
              defaultValue={searchParams.get("dateFrom") ?? ""}
              onChange={(e) => updateParam("dateFrom", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Hasta</Label>
            <Input
              type="date"
              defaultValue={searchParams.get("dateTo") ?? ""}
              onChange={(e) => updateParam("dateTo", e.target.value)}
            />
          </div>

          {hasAdvancedFilters && (
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Limpiar todo
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Select value={value || "all"} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`${label}: Todos`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{label}: Todos</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
