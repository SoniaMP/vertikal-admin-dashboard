"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { StepIndicator } from "./step-indicator";
import { buildRegistrationSteps } from "@/helpers/registration-steps";
import { PersonalDataForm } from "./personal-data-form";
import { MembershipModeStep } from "./membership-mode-step";
import { FederationStep } from "./federation-step";
import { ExternalLicenseStep } from "./external-license-step";
import { RegistrationSummary } from "./registration-summary";
import { RenewalBanner } from "./renewal-banner";
import { WizardErrorBanner } from "./wizard-error-banner";
import { PreviousLicenseNote } from "./previous-license-note";
import { useRegistrationSteps } from "@/hooks/use-registration-steps";
import { useRegistrationSubmit } from "@/hooks/use-registration-submit";
import { usePrivacyConsent } from "@/hooks/use-privacy-consent";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/validations/registration";
import type { LicenseCatalogType } from "@/types";
import type { PreviousLicense } from "@/lib/renewal-prefill";
import { EMPTY_REGISTRATION_VALUES } from "@/helpers/empty-registration-values";
import type { ReactNode } from "react";
import type { WizardExit } from "./wizard-exit-button";

/**
 * The alta is entered from the two cards, so step one steps back to them and
 * the later steps reach it through "Anterior". A renewal may already carry
 * data recovered from a code, so starting over is a real choice at any step,
 * and it says so rather than pointing backwards.
 */
const WIZARD_EXITS: Record<"new" | "renewal", WizardExit> = {
  new: { href: "/registro", label: "Volver", kind: "back" },
  renewal: { href: "/registro", label: "Empezar de nuevo", kind: "restart" },
};

type RegistrationWizardProps = {
  licenseTypes: LicenseCatalogType[];
  membershipFee: number;
  /** The season being joined, named in the notice when it has nothing to sell. */
  seasonYear: number;
  mode?: "new" | "renewal";
  defaultValues?: Partial<RegistrationInput>;
  /** Shown on step 3 when a renewing member had a license last season. */
  previousLicense?: PreviousLicense | null;
  /** The page's title, which belongs in the content column beside the index. */
  header?: ReactNode;
};

export function RegistrationWizard({
  licenseTypes,
  membershipFee,
  seasonYear,
  mode = "new",
  defaultValues,
  previousLicense = null,
  header,
}: RegistrationWizardProps) {
  // A season nobody has priced yet sells no licences, but it still takes
  // members: somebody federated elsewhere only needs the socio fee. So the
  // alta stays open and only the club branch closes.
  const clubLicensesClosed = licenseTypes.length === 0;

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    // Steps advance through `trigger`, not `handleSubmit`, so `isSubmitted`
    // never flips and the default `reValidateMode` never applies: an error
    // painted by "Siguiente" would sit there untouched while the member fixes
    // the field. `onTouched` revalidates once a field has been left, which
    // clears each message as the member moves on without flashing errors at
    // every keystroke across the eleven fields of step one.
    mode: "onTouched",
    defaultValues: {
      ...EMPTY_REGISTRATION_VALUES,
      ...defaultValues,
      // Last season's answer cannot stand when that branch is shut, and
      // there is nothing to choose between when only one option is left.
      ...(clubLicensesClosed ? { hasClubLicense: false } : {}),
    },
  });

  const { currentStep, goToStep, error, setError, goNext, goBack } =
    useRegistrationSteps({ form, mode });

  const { isSubmitting, submit } = useRegistrationSubmit({
    form,
    onError: setError,
  });

  // Lives here, not in the summary: that screen unmounts whenever the
  // member steps back, taking the answer with it.
  const consent = usePrivacyConsent();

  const exit = WIZARD_EXITS[mode];
  const laterStepsExit = mode === "renewal" ? exit : undefined;

  const hasClubLicense = useWatch({
    control: form.control,
    name: "hasClubLicense",
  });

  // The banner asks the member to check their data, which only means something
  // when there is data to check. Someone who chose to continue without
  // recovering theirs is looking at an empty form.
  const hasRecoveredData = mode === "renewal" && defaultValues !== undefined;

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        {hasRecoveredData && <RenewalBanner />}

        <div className="wizard-cols">
          <StepIndicator
            currentStep={currentStep}
            steps={buildRegistrationSteps(hasClubLicense)}
            onStepSelect={goToStep}
          />

          <div>
            {header && <div className="mb-10">{header}</div>}

            {error && <WizardErrorBanner>{error}</WizardErrorBanner>}

            {currentStep === 3 && previousLicense && (
              <div className="mb-6">
                <PreviousLicenseNote previousLicense={previousLicense} />
              </div>
            )}

            {currentStep === 1 && (
              <PersonalDataForm onNext={goNext} exit={exit} />
            )}

            {currentStep === 2 && (
              <MembershipModeStep
                onNext={goNext}
                onBack={goBack}
                exit={laterStepsExit}
                clubLicensesClosed={clubLicensesClosed}
                seasonYear={seasonYear}
              />
            )}

            {currentStep === 3 && hasClubLicense && (
              <FederationStep
                licenseTypes={licenseTypes}
                membershipFee={membershipFee}
                onNext={goNext}
                onBack={goBack}
                exit={laterStepsExit}
              />
            )}

            {currentStep === 3 && !hasClubLicense && (
              <ExternalLicenseStep
                onNext={goNext}
                onBack={goBack}
                exit={laterStepsExit}
              />
            )}

            {currentStep === 4 && (
              <RegistrationSummary
                licenseTypes={licenseTypes}
                membershipFee={membershipFee}
                consent={consent}
                onEdit={goToStep}
                onBack={goBack}
                onSubmit={submit}
                isSubmitting={isSubmitting}
                exit={laterStepsExit}
              />
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
