"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { StepIndicator } from "./step-indicator";
import { PersonalDataForm } from "./personal-data-form";
import { FederationStep } from "./federation-step";
import { RegistrationSummary } from "./registration-summary";
import { RenewalBanner } from "./renewal-banner";
import {
  personalDataSchema,
  licenseSelectionSchema,
  registrationSchema,
  type RegistrationInput,
} from "@/validations/registration";
import { checkDni } from "@/app/registro/actions";
import type { LicenseCatalogType } from "@/types";

type RegistrationWizardProps = {
  licenseTypes: LicenseCatalogType[];
  membershipFee: number;
  mode?: "new" | "renewal";
  defaultValues?: Partial<RegistrationInput>;
};

const EMPTY_DEFAULTS: RegistrationInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dni: "",
  dateOfBirth: "",
  address: "",
  city: "",
  postalCode: "",
  province: "",
  typeId: "",
  subtypeId: "",
  categoryId: "",
  supplementIds: [],
};

export function RegistrationWizard({
  licenseTypes,
  membershipFee,
  mode = "new",
  defaultValues,
}: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ReactNode>(null);

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  async function handleNextStep() {
    setError(null);

    if (currentStep === 1) {
      const isValid = await form.trigger(personalDataSchema.keyof().options);
      if (!isValid) return;

      if (mode === "new") {
        const check = await checkDni(form.getValues("dni"));

        if (check.reason === "dni_existe_con_membresia_temporada") {
          setError(
            "Ya tienes una membresía para esta temporada. Si tienes alguna duda, contacta con el club.",
          );
          return;
        }

        if (check.reason === "dni_existe_sin_membresia_temporada") {
          setError(
            <>
              Encontramos un socio con este DNI. Para continuar,{" "}
              <Link
                href="/registro/renovacion"
                className="font-semibold underline"
              >
                ve a renovación
              </Link>
              .
            </>,
          );
          return;
        }

        if (check.reason === "dni_invalido") {
          setError("DNI no válido. Revisa el campo.");
          return;
        }
      }

      setCurrentStep(2);
    } else if (currentStep === 2) {
      const isValid = await form.trigger(
        licenseSelectionSchema.keyof().options,
      );
      if (isValid) setCurrentStep(3);
    }
  }

  async function handleSubmit() {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const data = form.getValues();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result: { url?: string; error?: string };
      try {
        result = await response.json();
      } catch {
        setError("Error inesperado del servidor. Inténtalo de nuevo.");
        return;
      }

      if (!response.ok) {
        setError(result.error ?? "Error al procesar el registro");
        return;
      }

      if (!result.url) {
        setError("No se recibió la URL de pago. Inténtalo de nuevo.");
        return;
      }

      window.location.href = result.url;
    } catch {
      setError("Error de conexión. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        {mode === "renewal" && <RenewalBanner />}
        <StepIndicator currentStep={currentStep} />

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <PersonalDataForm onNext={handleNextStep} />
        )}

        {currentStep === 2 && (
          <FederationStep
            licenseTypes={licenseTypes}
            membershipFee={membershipFee}
            onNext={handleNextStep}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <RegistrationSummary
            licenseTypes={licenseTypes}
            membershipFee={membershipFee}
            onEdit={setCurrentStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </form>
    </Form>
  );
}
