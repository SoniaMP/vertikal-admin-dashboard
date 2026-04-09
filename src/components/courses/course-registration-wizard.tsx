"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StepIndicator } from "@/components/registration/step-indicator";
import { CourseRegistrationStep } from "./course-registration-step";
import { CourseRegistrationSummary } from "./course-registration-summary";

const COURSE_STEPS = [
  { number: 1, label: "Datos e inscripción" },
  { number: 2, label: "Resumen" },
];
import {
  courseRegistrationCheckoutSchema,
  type CourseRegistrationCheckoutInput,
} from "@/validations/course";

type PriceTier = {
  id: string;
  name: string;
  amountCents: number;
};

type Props = {
  courseCatalogId: string;
  courseTitle: string;
  prices: PriceTier[];
  isFull: boolean;
};

export function CourseRegistrationWizard({
  courseCatalogId,
  courseTitle,
  prices,
  isFull,
}: Props) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CourseRegistrationCheckoutInput>({
    resolver: zodResolver(courseRegistrationCheckoutSchema),
    defaultValues: {
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
      courseCatalogId,
      coursePriceId: "",
      licenseType: "",
      licenseFileUrl: "",
    },
  });

  async function handleNext() {
    const isValid = await form.trigger();
    if (isValid) setStep(2);
  }

  async function handleCheckout() {
    setIsSubmitting(true);
    setError(null);

    try {
      const data = form.getValues();
      const res = await fetch("/api/course-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result: { url?: string; error?: string };
      try {
        result = await res.json();
      } catch {
        setError("Error inesperado del servidor. Inténtalo de nuevo.");
        return;
      }

      if (!res.ok) {
        setError(result.error ?? "Error al procesar la inscripción");
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

  if (isFull) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="font-semibold text-destructive">
          No quedan plazas disponibles para este curso.
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <StepIndicator currentStep={step} steps={COURSE_STEPS} />

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {step === 1 && (
        <CourseRegistrationStep prices={prices} onNext={handleNext} />
      )}

      {step === 2 && (
        <CourseRegistrationSummary
          courseTitle={courseTitle}
          prices={prices}
          onBack={() => setStep(1)}
          onSubmit={handleCheckout}
          isSubmitting={isSubmitting}
        />
      )}
    </FormProvider>
  );
}
