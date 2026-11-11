"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PriceSummary } from "./price-summary";
import { SummarySection } from "./summary-section";
import { SummaryRow } from "./summary-row";
import { SummaryLicenseSection } from "./summary-license-section";
import { ConsentCheckbox } from "./consent-checkbox";
import {
  calculateTotal,
  calculateMemberOnlyTotal,
} from "@/helpers/price-calculator";
import type { LicenseCatalogType, PriceBreakdown } from "@/types";
import type { RegistrationInput } from "@/validations/registration";

const PERSONAL_DATA_STEP = 1;
const LICENSE_STEP = 3;

type RegistrationSummaryProps = {
  licenseTypes: LicenseCatalogType[];
  membershipFee: number;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

function buildBreakdown(
  data: RegistrationInput,
  licenseTypes: LicenseCatalogType[],
  membershipFee: number,
): PriceBreakdown | null {
  if (!data.hasClubLicense) return calculateMemberOnlyTotal(membershipFee);

  const licenseType = licenseTypes.find((lt) => lt.id === data.typeId);
  const category = licenseType?.categories.find(
    (c) => c.id === data.categoryId,
  );
  const categoryPrice = category?.prices.find(
    (p) => p.subtypeId === data.subtypeId,
  );
  if (!category || !categoryPrice) return null;

  const supplements =
    licenseType?.supplements.filter((s) =>
      data.supplementIds?.includes(s.id),
    ) ?? [];

  return calculateTotal(
    category.name,
    categoryPrice.price,
    supplements,
    membershipFee,
  );
}

export function RegistrationSummary({
  licenseTypes,
  membershipFee,
  onEdit,
  onSubmit,
  isSubmitting,
}: RegistrationSummaryProps) {
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
  const form = useFormContext<RegistrationInput>();
  const data = form.getValues();
  const breakdown = buildBreakdown(data, licenseTypes, membershipFee);

  return (
    <div className="space-y-6">
      <SummarySection
        title="Datos personales"
        onEdit={() => onEdit(PERSONAL_DATA_STEP)}
      >
        <SummaryRow
          label="Nombre"
          value={`${data.firstName} ${data.lastName}`}
        />
        <SummaryRow label="Email" value={data.email} />
        <SummaryRow label="Teléfono" value={data.phone} />
        <SummaryRow label="DNI" value={data.dni} />
        <SummaryRow label="Fecha de nacimiento" value={data.dateOfBirth} />
        <SummaryRow
          label="Sexo"
          value={data.sex === "M" ? "Hombre" : data.sex === "F" ? "Mujer" : ""}
        />
        <SummaryRow
          label="Dirección"
          value={`${data.address}, ${data.postalCode} ${data.city} (${data.province})`}
        />
      </SummarySection>

      <Separator />

      <SummaryLicenseSection
        data={data}
        licenseTypes={licenseTypes}
        onEdit={() => onEdit(LICENSE_STEP)}
      />

      {breakdown && (
        <>
          <Separator />
          <PriceSummary breakdown={breakdown} />
        </>
      )}

      <ConsentCheckbox
        isChecked={hasAcceptedPrivacy}
        onCheckedChange={setHasAcceptedPrivacy}
      />

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onEdit(LICENSE_STEP)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!hasAcceptedPrivacy || isSubmitting}
        >
          {isSubmitting ? "Procesando..." : "Proceder al pago"}
        </Button>
      </div>
    </div>
  );
}
