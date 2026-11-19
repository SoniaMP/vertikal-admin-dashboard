"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { formatBirthDate } from "@/helpers/birth-date-display";
import { PriceSummary } from "./price-summary";
import { SummarySection } from "./summary-section";
import { SummaryRow } from "./summary-row";
import { SummaryLicenseSection } from "./summary-license-section";
import { ConsentCheckbox } from "./consent-checkbox";
import { SummaryPayAction } from "./summary-pay-action";
import type { WizardExit } from "./wizard-exit-button";
import { payBlockReason } from "@/helpers/pay-block-reason";
import { buildPriceBreakdown } from "@/helpers/price-breakdown";
import type { PayBlocker } from "@/helpers/pay-block-reason";
import type { PrivacyConsent } from "@/hooks/use-privacy-consent";
import type { LicenseCatalogType } from "@/types";
import type { RegistrationInput } from "@/validations/registration";

const PERSONAL_DATA_STEP = 1;
const LICENSE_STEP = 3;

type RegistrationSummaryProps = {
  licenseTypes: LicenseCatalogType[];
  membershipFee: number;
  /** Held by the wizard, so it survives a trip back to an earlier step. */
  consent: PrivacyConsent;
  onEdit: (step: number) => void;
  /** One step back, which pops history. `onEdit` pushes, so it must not be
      used for a button labelled "Anterior": the two together loop. */
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  /** Shown beside "Anterior" when the flow offers a way out of itself. */
  exit?: WizardExit;
};

export function RegistrationSummary({
  licenseTypes,
  membershipFee,
  consent,
  onEdit,
  onBack,
  onSubmit,
  isSubmitting,
  exit,
}: RegistrationSummaryProps) {
  const [blocker, setBlocker] = useState<PayBlocker | null>(null);
  const consentRef = useRef<HTMLButtonElement>(null);
  const policyRef = useRef<HTMLButtonElement>(null);
  const form = useFormContext<RegistrationInput>();
  const data = form.getValues();
  const breakdown = buildPriceBreakdown(data, licenseTypes, membershipFee);

  function handlePay() {
    const reason = payBlockReason({
      hasTotal: breakdown !== null,
      hasOpenedPolicy: consent.hasOpenedPolicy,
      hasAcceptedPrivacy: consent.isChecked,
    });
    setBlocker(reason);
    if (!reason) {
      onSubmit();
      return;
    }
    // A disabled box cannot take focus, so an unread policy sends the
    // member to the link that opens it instead.
    if (reason.target === "policy") policyRef.current?.focus();
    if (reason.target === "consent") consentRef.current?.focus();
  }

  /** Clears the message as soon as the tick it asked for arrives. */
  const consentWithFeedback: PrivacyConsent = {
    ...consent,
    accept: (isChecked) => {
      consent.accept(isChecked);
      if (isChecked) setBlocker(null);
    },
  };

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
        <SummaryRow
          label="Fecha de nacimiento"
          value={formatBirthDate(data.dateOfBirth)}
        />
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
        consent={consentWithFeedback}
        focusRef={consentRef}
        policyRef={policyRef}
      />

      <SummaryPayAction
        blocker={blocker}
        isSubmitting={isSubmitting}
        onBack={onBack}
        onPay={handlePay}
        exit={exit}
      />
    </div>
  );
}
