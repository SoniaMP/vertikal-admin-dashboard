"use client";

import { useFormContext } from "react-hook-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardExitButton, type WizardExit } from "./wizard-exit-button";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ClubLicensesClosedNotice } from "./club-licenses-closed-notice";
import { MembershipModeOption } from "./membership-mode-option";
import type { RegistrationInput } from "@/validations/registration";

type MembershipModeStepProps = {
  onNext: () => void;
  onBack: () => void;
  /** Shown beside "Anterior" when the flow offers a way out of itself. */
  exit?: WizardExit;
  /** True while the season has nothing the club can sell. */
  clubLicensesClosed?: boolean;
  seasonYear: number;
};

const CLUB_MODE = "club";
const EXTERNAL_MODE = "external";

const MODE_OPTIONS = [
  {
    value: CLUB_MODE,
    title: "Quiero federarme con el Club Vertikal",
    description:
      "Tramitamos tu licencia. En el siguiente paso eliges tipo, categoría y suplementos.",
  },
  {
    value: EXTERNAL_MODE,
    title: "Ya tengo licencia en vigor",
    description:
      "Te das de alta solo como socio. Te pediremos el PDF de tu licencia para comprobar que está vigente.",
  },
];

// The field is a boolean but RadioGroup works on strings, and an unanswered
// step must leave both cards unselected rather than defaulting to one.
function toRadioValue(hasClubLicense: boolean | undefined) {
  if (hasClubLicense === undefined) return "";
  return hasClubLicense ? CLUB_MODE : EXTERNAL_MODE;
}

export function MembershipModeStep({
  onNext,
  onBack,
  exit,
  clubLicensesClosed = false,
  seasonYear,
}: MembershipModeStepProps) {
  const form = useFormContext<RegistrationInput>();

  return (
    <div className="space-y-6">
      {clubLicensesClosed && <ClubLicensesClosedNotice year={seasonYear} />}

      <FormField
        control={form.control}
        name="hasClubLicense"
        render={({ field }) => (
          <FormItem>
            <h3 className="text-lg font-semibold">Licencia federativa</h3>

            <FormControl>
              <RadioGroup
                value={toRadioValue(field.value)}
                // Revalidates on pick so the "choose an option" message clears
                // as soon as the member actually picks one.
                onValueChange={(value) =>
                  form.setValue("hasClubLicense", value === CLUB_MODE, {
                    shouldValidate: true,
                  })
                }
                className="grid gap-3"
              >
                {MODE_OPTIONS.map((option) => (
                  <MembershipModeOption
                    key={option.value}
                    option={option}
                    isSelected={toRadioValue(field.value) === option.value}
                    isClosed={clubLicensesClosed && option.value === CLUB_MODE}
                    closedNote={`No disponible todavía para la temporada ${seasonYear}.`}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
