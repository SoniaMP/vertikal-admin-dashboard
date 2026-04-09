"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DataProtectionDialog } from "@/components/registration/data-protection-dialog";
import { formatPrice } from "@/helpers/price-calculator";
import type { CourseRegistrationCheckoutInput } from "@/validations/course";

type PriceTier = {
  id: string;
  name: string;
  amountCents: number;
};

type Props = {
  courseTitle: string;
  prices: PriceTier[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function CourseRegistrationSummary({
  courseTitle,
  prices,
  onBack,
  onSubmit,
  isSubmitting,
}: Props) {
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
  const form = useFormContext<CourseRegistrationCheckoutInput>();
  const data = form.getValues();

  const selectedPrice = prices.find((p) => p.id === data.coursePriceId);

  return (
    <div className="space-y-6">
      <PersonalDataSection data={data} />
      <Separator />
      <CourseSection
        courseTitle={courseTitle}
        licenseType={data.licenseType}
        priceName={selectedPrice?.name}
        amountCents={selectedPrice?.amountCents}
      />
      <Separator />
      <ConsentCheckbox
        isChecked={hasAcceptedPrivacy}
        onCheckedChange={setHasAcceptedPrivacy}
      />
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Anterior
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!hasAcceptedPrivacy || isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting ? "Procesando..." : "Proceder al pago"}
        </Button>
      </div>
    </div>
  );
}

function PersonalDataSection({
  data,
}: {
  data: CourseRegistrationCheckoutInput;
}) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold">Datos personales</h3>
      <div className="space-y-2">
        <SummaryRow
          label="Nombre"
          value={`${data.firstName} ${data.lastName}`}
        />
        <SummaryRow label="Email" value={data.email} />
        <SummaryRow label="Teléfono" value={data.phone} />
        <SummaryRow label="DNI" value={data.dni} />
        <SummaryRow label="Fecha de nacimiento" value={data.dateOfBirth} />
        <SummaryRow
          label="Dirección"
          value={`${data.address}, ${data.postalCode} ${data.city} (${data.province})`}
        />
      </div>
    </div>
  );
}

type CourseSectionProps = {
  courseTitle: string;
  licenseType: string;
  priceName?: string;
  amountCents?: number;
};

function CourseSection({
  courseTitle,
  licenseType,
  priceName,
  amountCents,
}: CourseSectionProps) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold">Curso e inscripción</h3>
      <div className="space-y-2">
        <SummaryRow label="Curso" value={courseTitle} />
        <SummaryRow label="Licencia federativa" value={licenseType} />
        {priceName && <SummaryRow label="Tarifa" value={priceName} />}
        {amountCents != null && (
          <SummaryRow label="Total" value={formatPrice(amountCents)} isBold />
        )}
      </div>
    </div>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  isBold?: boolean;
};

function SummaryRow({ label, value, isBold }: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={isBold ? "font-bold" : "font-medium"}>{value}</span>
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
