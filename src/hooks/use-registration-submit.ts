"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { RegistrationInput } from "@/validations/registration";

type UseRegistrationSubmitArgs = {
  form: UseFormReturn<RegistrationInput>;
  onError: (message: string) => void;
};

/**
 * Validates the whole registration and hands it to the checkout route, then
 * sends the member on to Stripe. Every failure path reports a message the
 * member can act on rather than leaving the button spinning.
 */
export function useRegistrationSubmit({
  form,
  onError,
}: UseRegistrationSubmitArgs) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!(await form.trigger())) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.getValues()),
      });

      let result: { url?: string; error?: string };
      try {
        result = await response.json();
      } catch {
        onError("Error inesperado del servidor. Inténtalo de nuevo.");
        return;
      }

      if (!response.ok) {
        onError(result.error ?? "Error al procesar el registro");
        return;
      }

      if (!result.url) {
        onError("No se recibió la URL de pago. Inténtalo de nuevo.");
        return;
      }

      window.location.href = result.url;
    } catch {
      onError("Error de conexión. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, submit };
}
