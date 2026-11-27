"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LicenseCatalogType, CategoryOffering } from "@/types";

type Props = {
  catalog: LicenseCatalogType[];
  defaultTypeId?: string;
  defaultSubtypeId?: string;
  defaultCategoryId?: string;
};

export function FederationCascadingSelects({
  catalog,
  defaultTypeId = "",
  defaultSubtypeId = "",
  defaultCategoryId = "",
}: Props) {
  const [selectedTypeId, setSelectedTypeId] = useState(defaultTypeId);
  const [selectedSubtypeId, setSelectedSubtypeId] = useState(defaultSubtypeId);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState(defaultCategoryId);

  const selectedType = catalog.find((t) => t.id === selectedTypeId);

  const catalogPriceEuros = useMemo(() => {
    if (!selectedCategoryId || !selectedSubtypeId || !selectedType) return null;
    const category = selectedType.categories.find(
      (c) => c.id === selectedCategoryId,
    );
    const cents = category?.prices.find(
      (p) => p.subtypeId === selectedSubtypeId,
    )?.price;
    return cents != null ? (cents / 100).toFixed(2) : null;
  }, [selectedType, selectedSubtypeId, selectedCategoryId]);

  const [priceOverride, setPriceOverride] = useState<string>("");

  const displayPrice =
    priceOverride !== "" ? priceOverride : (catalogPriceEuros ?? "");

  function handleTypeChange(typeId: string) {
    setSelectedTypeId(typeId);
    setSelectedSubtypeId("");
    setSelectedCategoryId("");
    setPriceOverride("");
  }

  function handleSubtypeChange(subtypeId: string) {
    setSelectedSubtypeId(subtypeId);
    setSelectedCategoryId("");
    setPriceOverride("");
  }

  function handleCategoryChange(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setPriceOverride("");
  }

  return (
    <>
      <TypeSelect
        catalog={catalog}
        defaultTypeId={defaultTypeId}
        selectedTypeId={selectedTypeId}
        onChange={handleTypeChange}
      />

      <SubtypeSelect
        subtypes={selectedType?.subtypes ?? []}
        selectedTypeId={selectedTypeId}
        defaultTypeId={defaultTypeId}
        defaultSubtypeId={defaultSubtypeId}
        onChange={handleSubtypeChange}
      />

      <CategorySelect
        categories={selectedType?.categories ?? []}
        selectedSubtypeId={selectedSubtypeId}
        selectedCategoryId={selectedCategoryId}
        defaultCategoryId={
          selectedTypeId === defaultTypeId &&
          selectedSubtypeId === defaultSubtypeId
            ? defaultCategoryId
            : ""
        }
        onChange={handleCategoryChange}
      />

      {selectedCategoryId && (
        <div className="space-y-1">
          <Label htmlFor="totalAmount">Precio (€)</Label>
          <Input
            id="totalAmount"
            name="totalAmount"
            type="number"
            step="0.01"
            min="0"
            value={displayPrice}
            onChange={(e) => setPriceOverride(e.target.value)}
          />
        </div>
      )}
    </>
  );
}

function TypeSelect({
  catalog,
  defaultTypeId,
  selectedTypeId,
  onChange,
}: {
  catalog: LicenseCatalogType[];
  defaultTypeId: string;
  selectedTypeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor="typeId">Tipo de licencia</Label>
      <Select
        name="typeId"
        defaultValue={defaultTypeId}
        value={selectedTypeId}
        onValueChange={onChange}
      >
        <SelectTrigger id="typeId">
          <SelectValue placeholder="Seleccionar..." />
        </SelectTrigger>
        <SelectContent>
          {catalog.map((lt) => (
            <SelectItem key={lt.id} value={lt.id}>
              {lt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SubtypeSelect({
  subtypes,
  selectedTypeId,
  defaultTypeId,
  defaultSubtypeId,
  onChange,
}: {
  subtypes: { id: string; name: string }[];
  selectedTypeId: string;
  defaultTypeId: string;
  defaultSubtypeId: string;
  onChange: (id: string) => void;
}) {
  const defaultValue = selectedTypeId === defaultTypeId ? defaultSubtypeId : "";

  return (
    <div className="space-y-1">
      <Label htmlFor="subtypeId">Subtipo</Label>
      <Select
        key={`subtype-${selectedTypeId}`}
        name="subtypeId"
        defaultValue={defaultValue}
        onValueChange={onChange}
      >
        <SelectTrigger id="subtypeId">
          <SelectValue placeholder="Seleccionar..." />
        </SelectTrigger>
        <SelectContent>
          {subtypes.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CategorySelect({
  categories,
  selectedSubtypeId,
  selectedCategoryId,
  defaultCategoryId,
  onChange,
}: {
  categories: CategoryOffering[];
  selectedSubtypeId: string;
  selectedCategoryId: string;
  defaultCategoryId: string;
  onChange: (id: string) => void;
}) {
  const filtered = categories.filter((c) =>
    c.prices.some((p) => p.subtypeId === selectedSubtypeId),
  );

  return (
    <div className="space-y-1">
      <Label htmlFor="categoryId">Categoría</Label>
      <Select
        key={`category-${selectedSubtypeId}`}
        name="categoryId"
        defaultValue={defaultCategoryId}
        value={selectedCategoryId || undefined}
        onValueChange={onChange}
      >
        <SelectTrigger id="categoryId">
          <SelectValue placeholder="Seleccionar..." />
        </SelectTrigger>
        <SelectContent>
          {filtered.map((c) => {
            const price = c.prices.find(
              (p) => p.subtypeId === selectedSubtypeId,
            )?.price;
            return (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
                {price != null && ` — ${(price / 100).toFixed(2)} €`}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
