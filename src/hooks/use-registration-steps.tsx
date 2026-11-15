"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { FieldPath, UseFormReturn } from "react-hook-form";
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
 *
 * Every step validates with `shouldFocus`. Step one alone has eleven fields, so
 * on a phone the button sits far below the one that failed: without the focus
 * jump, pressing "Siguiente" looks like nothing happened at all.
 */
export function useRegistrationSteps({ form, mode }: UseRegistrationStepsArgs) {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<ReactNode>(null);

  function fieldsForStep(step: number): FieldPath<RegistrationInput>[] {
    if (step === 1) return [...personalDataSchema.keyof().options];
    if (step === 2) return [...MEMBERSHIP_MODE_FIELDS];
    return form.getValues("hasClubLicense")
      ? [...CLUB_LICENSE_FIELDS]
      : [...EXTERNAL_LICENSE_FIELDS];
  }

  /**
   * The form revalidates a field once it has been touched, and `trigger` never
   * touches anything. Left alone, an error raised by "Siguiente" would outlive
   * every later change to that field, because the two ways of filling this form
   * that do not blur are exactly the common ones: picking a radio option with
   * one tap, and letting the browser autofill the whole step at once.
   *
   * Touching the fields only after a step fails keeps the quiet start: nobody
   * gets an error for a name that is still half typed, but once a message is on
   * screen it clears as soon as the value is good, however it got there.
   */
  function markStepTouched(fields: FieldPath<RegistrationInput>[]) {
    for (const field of fields) {
      form.setValue(field, form.getValues(field), { shouldTouch: true });
    }
  }

  async function isDniFree() {
    const check = await checkDni(form.getValues("dni"));
    const message = dniErrorMessage(check.reason);
    if (message) {
      setError(message);
      return false;
    }
    return true;
  }

  async function validateStep(step: number) {
    const fields = fieldsForStep(step);
    const isValid = await form.trigger(fields, { shouldFocus: true });

    if (!isValid) {
      markStepTouched(fields);
      return false;
    }
    if (step === 1 && mode === "new") return isDniFree();
    return true;
  }

  async function goNext() {
    setError(null);
    if (currentStep > 3) return;
    if (await validateStep(currentStep)) setCurrentStep(currentStep + 1);
  }

  function goBack() {
    setError(null);
    setCurrentStep((step) => Math.max(1, step - 1));
  }

  return { currentStep, setCurrentStep, error, setError, goNext, goBack };
}
