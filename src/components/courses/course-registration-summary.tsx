"use client";

import { useFormContext } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConsentCheckbox } from "@/components/registration/consent-checkbox";
import { formatPrice } from "@/helpers/price-calculator";
import type { CourseRegistrationCheckoutInput } from "@/validations/course";
import type { PrivacyConsent } from "@/hooks/use-privacy-consent";

type PriceTier = {
  id: string;
  name: string;
  amountCents: number;
};

type Props = {
  courseTitle: string;
  prices: PriceTier[];
  /** Held by the wizard, so it survives a trip back to the form. */
  consent: PrivacyConsent;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function CourseRegistrationSummary({
  courseTitle,
  prices,
  consent,
  onBack,
  onSubmit,
  isSubmitting,
}: Props) {
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
      <ConsentCheckbox consent={consent} />
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Anterior
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!consent.isChecked || isSubmitting}
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
