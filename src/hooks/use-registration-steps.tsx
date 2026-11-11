"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import {
  personalDataSchema,
  MEMBERSHIP_MODE_FIELDS,
  CLUB_LICENSE_FIELDS,
  EXTERNAL_LICENSE_FIELDS,
  type RegistrationInput,
} from "@/validations/registration";
import { checkDni } from "@/app/registro/actions";

type UseRegistrationStepsArgs = {
  form: UseFormReturn<RegistrationInput>;
  mode: "new" | "renewal";
};

function dniErrorMessage(reason: string | undefined): ReactNode {
  if (reason === "dni_existe_con_membresia_temporada") {
    return "Ya tienes una membresía para esta temporada. Si tienes alguna duda, contacta con el club.";
  }
  if (reason === "dni_existe_sin_membresia_temporada") {
    return (
      <>
        Encontramos un socio con este DNI. Para continuar,{" "}
        <Link href="/registro/renovacion" className="font-semibold underline">
          ve a renovación
        </Link>
        .
      </>
    );
  }
  if (reason === "dni_invalido") return "DNI no válido. Revisa el campo.";
  return null;
}

/**
 * Drives the four-step registration wizard. Step 3 validates a different field
 * set depending on whether the member buys the federation license through the
 * club or proves one obtained elsewhere.
 */
export function useRegistrationSteps({ form, mode }: UseRegistrationStepsArgs) {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<ReactNode>(null);

  async function validatePersonalData() {
    const isValid = await form.trigger(personalDataSchema.keyof().options);
    if (!isValid) return false;
    if (mode !== "new") return true;

    const check = await checkDni(form.getValues("dni"));
    const message = dniErrorMessage(check.reason);
    if (message) {
      setError(message);
      return false;
    }
    return true;
  }

  function validateLicenseStep() {
    const fields = form.getValues("hasClubLicense")
      ? CLUB_LICENSE_FIELDS
      : EXTERNAL_LICENSE_FIELDS;
    return form.trigger([...fields]);
  }

  async function goNext() {
    setError(null);

    const validators: Record<number, () => Promise<boolean>> = {
      1: validatePersonalData,
      2: () => form.trigger([...MEMBERSHIP_MODE_FIELDS]),
      3: validateLicenseStep,
    };

    const validate = validators[currentStep];
    if (!validate) return;
    if (await validate()) setCurrentStep(currentStep + 1);
  }

  function goBack() {
    setError(null);
    setCurrentStep((step) => Math.max(1, step - 1));
  }

  return { currentStep, setCurrentStep, error, setError, goNext, goBack };
}
