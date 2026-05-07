"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { PriceSummary } from "./price-summary";
import { DataProtectionDialog } from "./data-protection-dialog";
import { calculateTotal } from "@/helpers/price-calculator";
import type { LicenseCatalogType } from "@/types";
import type { RegistrationInput } from "@/validations/registration";

type RegistrationSummaryProps = {
  licenseTypes: LicenseCatalogType[];
  membershipFee: number;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

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

  const licenseType = licenseTypes.find(
    (lt) => lt.id === data.typeId,
  );
  const subtype = licenseType?.subtypes.find(
    (st) => st.id === data.subtypeId,
  );
  const category = licenseType?.categories.find(
    (c) => c.id === data.categoryId,
  );
  const categoryPrice = category?.prices.find(
    (p) => p.subtypeId === data.subtypeId,
  );
  const selectedSupplements =
    licenseType?.supplements.filter((s) =>
      data.supplementIds?.includes(s.id),
    ) ?? [];

  const breakdown =
    category && categoryPrice
      ? calculateTotal(category.name, categoryPrice.price, selectedSupplements, membershipFee)
      : null;

  return (
    <div className="space-y-6">
      <SummarySection title="Datos personales" onEdit={() => onEdit(1)}>
        <SummaryRow label="Nombre" value={`${data.firstName} ${data.lastName}`} />
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

      <SummarySection title="Licencia y suplementos" onEdit={() => onEdit(2)}>
        <SummaryRow label="Tipo" value={licenseType?.name ?? ""} />
        {subtype && (
          <SummaryRow label="Modalidad" value={subtype.name} />
        )}
        {category && (
          <SummaryRow label="Categoría" value={category.name} />
        )}
        {selectedSupplements.length > 0 && (
          <SummaryRow
            label="Suplementos"
            value={selectedSupplements.map((s) => s.name).join(", ")}
          />
        )}
      </SummarySection>

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
        <Button type="button" variant="outline" onClick={() => onEdit(2)}>
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

type SummarySectionProps = {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
};

function SummarySection({ title, onEdit, children }: SummarySectionProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </Button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

type ConsentCheckboxProps = {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function ConsentCheckbox({ isChecked, onCheckedChange }: ConsentCheckboxProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
        <Checkbox
          checked={isChecked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm leading-snug">
          He leído y acepto la{" "}
          <button
            type="button"
            className="text-primary underline underline-offset-2 hover:opacity-80"
            onClick={(e) => {
              e.preventDefault();
              setIsDialogOpen(true);
            }}
          >
            Política de Privacidad
          </button>{" "}
          y consiento el tratamiento de mis datos personales conforme al RGPD.
        </span>
      </label>

      <DataProtectionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
