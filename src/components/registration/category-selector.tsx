"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/helpers/price-calculator";
import { buildCategoryOptions } from "@/helpers/category-options";
import { ClubContactLink } from "@/components/contact/club-contact-link";
import type { CategoryOption } from "@/helpers/category-options";
import type { CategoryOffering } from "@/types";
import type { RegistrationInput } from "@/validations/registration";

type CategorySelectorProps = {
  categories: CategoryOffering[];
  selectedSubtypeId: string;
  subtypeName: string;
};

/**
 * A category only has a price when the catalog holds an offering for it in the
 * chosen modality. Offering the others anyway would let the member fill in the
 * whole wizard and only hit "no such offering" when the server builds the
 * payment, with nothing telling them what to change.
 */
function CategoryItem({
  option,
  subtypeName,
}: {
  option: CategoryOption;
  subtypeName: string;
}) {
  if (option.price !== null) {
    return (
      <SelectItem value={option.id}>
        {option.name} — {formatPrice(option.price)}
      </SelectItem>
    );
  }

  return (
    <SelectItem value={option.id} disabled>
      <span className="flex flex-col items-start">
        <span>{option.name}</span>
        <span className="text-xs text-muted-foreground">
          No disponible en {subtypeName}
        </span>
      </span>
    </SelectItem>
  );
}

export function CategorySelector({
  categories,
  selectedSubtypeId,
  subtypeName,
}: CategorySelectorProps) {
  const form = useFormContext<RegistrationInput>();

  const options = buildCategoryOptions(categories, selectedSubtypeId);
  if (options.length === 0) return null;

  const hasAnyOffering = options.some((option) => option.price !== null);

  return (
    <FormField
      control={form.control}
      name="categoryId"
      render={({ field }) => (
        <FormItem>
          <h3 className="text-lg font-semibold">Categoría</h3>
          {hasAnyOffering ? (
            <FormControl>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <CategoryItem
                      key={option.id}
                      option={option}
                      subtypeName={subtypeName}
                    />
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Todavía no hay precios para {subtypeName} esta temporada. Elige
              otra modalidad o escríbenos a{" "}
              <ClubContactLink subject="No hay precios para mi modalidad" /> y lo
              resolvemos.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
