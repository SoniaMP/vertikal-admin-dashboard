"use client";

import { useForm, useWatch, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { StepIndicator } from "./step-indicator";
import { PersonalDataForm } from "./personal-data-form";
import { MembershipModeStep } from "./membership-mode-step";
import { FederationStep } from "./federation-step";
import { ExternalLicenseStep } from "./external-license-step";
import { RegistrationSummary } from "./registration-summary";
import { RenewalBanner } from "./renewal-banner";
import { useRegistrationSteps } from "@/hooks/use-registration-steps";
import { useRegistrationSubmit } from "@/hooks/use-registration-submit";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/validations/registration";
import type { LicenseCatalogType } from "@/types";

type RegistrationWizardProps = {
  licenseTypes: LicenseCatalogType[];
  membershipFee: number;
  mode?: "new" | "renewal";
  defaultValues?: Partial<RegistrationInput>;
};

// `hasClubLicense` is deliberately absent: step 2 must start with neither card
// selected so the member makes an explicit choice.
const EMPTY_DEFAULTS: DefaultValues<RegistrationInput> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dni: "",
  dateOfBirth: "",
  sex: "",
  address: "",
  city: "",
  postalCode: "",
  province: "",
  typeId: "",
  subtypeId: "",
  categoryId: "",
  supplementIds: [],
  externalLicenseLabel: "",
  externalLicenseFileUrl: "",
};

function buildSteps(hasClubLicense: boolean | undefined) {
  return [
    { number: 1, label: "Datos personales" },
    { number: 2, label: "Licencia" },
    { number: 3, label: hasClubLicense === false ? "Tu licencia" : "Federativa" },
    { number: 4, label: "Resumen" },
  ];
}

export function RegistrationWizard({
  licenseTypes,
  membershipFee,
  mode = "new",
  defaultValues,
}: RegistrationWizardProps) {
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    // Steps advance through `trigger`, not `handleSubmit`, so `isSubmitted`
    // never flips and the default `reValidateMode` never applies: an error
    // painted by "Siguiente" would sit there untouched while the member fixes
    // the field. `onTouched` revalidates once a field has been left, which
    // clears each message as the member moves on without flashing errors at
    // every keystroke across the eleven fields of step one.
    mode: "onTouched",
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  const { currentStep, setCurrentStep, error, setError, goNext, goBack } =
    useRegistrationSteps({ form, mode });

  const { isSubmitting, submit } = useRegistrationSubmit({
    form,
    onError: setError,
  });

  const hasClubLicense = useWatch({
    control: form.control,
    name: "hasClubLicense",
  });

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        {mode === "renewal" && <RenewalBanner />}
        <StepIndicator
          currentStep={currentStep}
          steps={buildSteps(hasClubLicense)}
        />

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {currentStep === 1 && <PersonalDataForm onNext={goNext} />}

        {currentStep === 2 && (
          <MembershipModeStep onNext={goNext} onBack={goBack} />
        )}

        {currentStep === 3 && hasClubLicense && (
          <FederationStep
            licenseTypes={licenseTypes}
            membershipFee={membershipFee}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 3 && !hasClubLicense && (
          <ExternalLicenseStep onNext={goNext} onBack={goBack} />
        )}

        {currentStep === 4 && (
          <RegistrationSummary
            licenseTypes={licenseTypes}
            membershipFee={membershipFee}
            onEdit={setCurrentStep}
            onSubmit={submit}
            isSubmitting={isSubmitting}
          />
        )}
      </form>
    </Form>
  );
}
