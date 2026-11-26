"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { formatPrice } from "@/helpers/price-calculator";
import type { SupplementSummary, SupplementGroupSummary } from "@/types";
import type { RegistrationInput } from "@/validations/registration";

type SupplementSelectorProps = {
  supplements: SupplementSummary[];
  supplementGroups: SupplementGroupSummary[];
};

export function SupplementSelector({
  supplements,
  supplementGroups,
}: SupplementSelectorProps) {
  const activeSupplements = supplements.filter((s) => s.active);
  if (activeSupplements.length === 0) return null;

  const individual = activeSupplements.filter((s) => !s.supplementGroupId);
  const groupedByGroupId = new Map<string, SupplementSummary[]>();

  for (const s of activeSupplements) {
    if (s.supplementGroupId) {
      const arr = groupedByGroupId.get(s.supplementGroupId) ?? [];
      arr.push(s);
      groupedByGroupId.set(s.supplementGroupId, arr);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Suplementos opcionales</h3>
      <div className="grid gap-2">
        {individual.map((supplement) => (
          <SupplementCheckbox
            key={supplement.id}
            supplement={supplement}
            priceLabel={
              supplement.price !== null
                ? `+${formatPrice(supplement.price)}`
                : ""
            }
          />
        ))}
        {supplementGroups.map((group) => {
          const groupSupplements = groupedByGroupId.get(group.id);
          if (!groupSupplements?.length) return null;
          return (
            <GroupSection
              key={group.id}
              group={group}
              supplements={groupSupplements}
            />
          );
        })}
      </div>
    </div>
  );
}

function GroupSection({
  group,
  supplements,
}: {
  group: SupplementGroupSummary;
  supplements: SupplementSummary[];
}) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{group.name}</span>
        <span className="text-sm font-semibold text-primary">
          +{formatPrice(group.price)}
        </span>
      </div>
      {/* The member has never heard of a supplement group, so the wording
          names a kind of fare instead of explaining the billing: "precio
          único" is what a menu or a season ticket says, and it answers the
          only question they have — whether ticking two costs double. The
          amount is not repeated; it is on the line above. */}
      <p className="text-xs text-muted-foreground">
        Precio único, elijas lo que elijas.
      </p>
      <div className="grid gap-1">
        {supplements.map((supplement) => (
          <SupplementCheckbox
            key={supplement.id}
            supplement={supplement}
            priceLabel=""
          />
        ))}
      </div>
    </div>
  );
}

function SupplementCheckbox({
  supplement,
  priceLabel,
}: {
  supplement: SupplementSummary;
  priceLabel: string;
}) {
  const form = useFormContext<RegistrationInput>();

  return (
    <FormField
      control={form.control}
      name="supplementIds"
      render={({ field }) => {
        const isChecked = field.value?.includes(supplement.id);
        return (
          <FormItem>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
              <FormControl>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const current = field.value ?? [];
                    field.onChange(
                      checked
                        ? [...current, supplement.id]
                        : current.filter(
                            (id: string) => id !== supplement.id,
                          ),
                    );
                  }}
                />
              </FormControl>
              <div className="flex flex-1 items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-medium">{supplement.name}</span>
                  <p className="text-sm text-muted-foreground">
                    {supplement.description}
                  </p>
                </div>
                {priceLabel && (
                  <span className="shrink-0 font-semibold">{priceLabel}</span>
                )}
              </div>
            </label>
          </FormItem>
        );
      }}
    />
  );
}
