"use client";

import { useFormContext } from "react-hook-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardExitButton, type WizardExit } from "./wizard-exit-button";
import { FederationSelector } from "./federation-selector";
import { SubtypeSelector } from "./subtype-selector";
import { CategorySelector } from "./category-selector";
import { SupplementSelector } from "./supplement-selector";
import { PriceSummary } from "./price-summary";
import { calculateTotal } from "@/helpers/price-calculator";
import type { LicenseCatalogType } from "@/types";
import type { RegistrationInput } from "@/validations/registration";

type FederationStepProps = {
  licenseTypes: LicenseCatalogType[];
  membershipFee: number;
  onNext: () => void;
  onBack: () => void;
  /** Shown beside "Anterior" when the flow offers a way out of itself. */
  exit?: WizardExit;
};

export function FederationStep({
  licenseTypes,
  membershipFee,
  onNext,
  onBack,
  exit,
}: FederationStepProps) {
  const form = useFormContext<RegistrationInput>();
  const selectedTypeId = form.watch("typeId");
  const selectedSubtypeId = form.watch("subtypeId");
  const selectedCategoryId = form.watch("categoryId");
  const selectedSupplementIds = form.watch("supplementIds");

  const selectedType = licenseTypes.find(
    (lt) => lt.id === selectedTypeId,
  );

  const selectedSubtype = selectedType?.subtypes.find(
    (st) => st.id === selectedSubtypeId,
  );

  const selectedCategory = selectedType?.categories.find(
    (c) => c.id === selectedCategoryId,
  );

  const categoryPrice = selectedCategory?.prices.find(
    (p) => p.subtypeId === selectedSubtypeId,
  );

  const selectedSupplements =
    selectedType?.supplements.filter((s) =>
      selectedSupplementIds?.includes(s.id),
    ) ?? [];

  const breakdown =
    selectedCategory && categoryPrice
      ? calculateTotal(
          selectedCategory.name,
          categoryPrice.price,
          selectedSupplements,
          membershipFee,
        )
      : null;

  return (
    <div className="space-y-6">
      <FederationSelector licenseTypes={licenseTypes} />

      {selectedType && (
        <SubtypeSelector subtypes={selectedType.subtypes} />
      )}

      {selectedSubtype && selectedType && (
        <CategorySelector
          categories={selectedType.categories}
          selectedSubtypeId={selectedSubtypeId}
          subtypeName={selectedSubtype.name}
        />
      )}

      {selectedCategory && (
        <>
          <SupplementSelector
            supplements={selectedType!.supplements}
            supplementGroups={selectedType!.supplementGroups}
          />
          {breakdown && <PriceSummary breakdown={breakdown} />}
        </>
      )}

      <div className="flex justify-between gap-3">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            Anterior
          </Button>
          {exit && <WizardExitButton exit={exit} />}
        </div>
        <Button type="button" onClick={onNext}>
          Siguiente
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
