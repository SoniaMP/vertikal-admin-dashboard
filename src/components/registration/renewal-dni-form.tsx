"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dniSchema } from "@/validations/registration";
import { requestRenewalCode } from "@/app/registro/renewal-actions";

type RenewalDniFormProps = {
  onCodeSent: (dni: string) => void;
  /** Carries on with an empty form, for anyone who cannot read the code. */
  onSkip: () => void;
  /** Where "Volver" leads, in the row the wizard's steps also use. */
  backHref: string;
};

const MESSAGES = {
  invalid_dni:
    "Documento no válido. Son de 5 a 20 letras y números, sin espacios ni guiones.",
  rate_limited:
    "Ya se han pedido varios códigos para este DNI. Espera una hora, o continúa sin recuperar tus datos.",
  error: "No hemos podido enviar el código. Inténtalo de nuevo.",
};

export function RenewalDniForm({
  onCodeSent,
  onSkip,
  backHref,
}: RenewalDniFormProps) {
  const [dni, setDni] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // The button stays enabled on purpose. A primary action that greys out
  // without saying why reads as a broken page, so the reason is spoken here.
  async function handleSubmit() {
    if (!dniSchema.safeParse(dni).success) {
      setMessage(MESSAGES.invalid_dni);
      inputRef.current?.focus();
      return;
    }

    setMessage(null);
    setIsSending(true);
    try {
      const result = await requestRenewalCode(dni);
      if (result.status === "sent") {
        onCodeSent(dni);
        return;
      }
      setMessage(MESSAGES[result.status]);
      inputRef.current?.focus();
    } catch {
      setMessage(MESSAGES.error);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="renewal-dni">DNI, NIE o pasaporte del socio</Label>
        <Input
          id="renewal-dni"
          ref={inputRef}
          value={dni}
          placeholder="12345678Z"
          maxLength={20}
          autoComplete="off"
          autoCapitalize="characters"
          aria-describedby={message ? "renewal-dni-message" : undefined}
          onChange={(e) => {
            setDni(e.target.value.trim());
            if (message) setMessage(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <p className="text-xs text-muted-foreground">
          Te enviaremos un código al correo que tenemos registrado, para
          comprobar que eres tú antes de mostrar tus datos.
        </p>
      </div>

      {message && (
        <p
          id="renewal-dni-message"
          role="alert"
          className="text-sm text-destructive"
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap justify-between gap-3 pt-4">
        <Button type="button" variant="outline" asChild>
          <Link href={backHref}>
            <ArrowLeft aria-hidden="true" />
            Volver
          </Link>
        </Button>

        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onSkip}>
              Continuar sin recuperar mis datos
            </Button>
            {/* The spinner takes the arrow's place rather than crowding
                beside it: two icons on one button is noise. */}
            <Button type="button" onClick={handleSubmit} disabled={isSending}>
              Enviarme un código
              {isSending ? (
                <Loader2 aria-hidden="true" className="animate-spin" />
              ) : (
                <ArrowRight aria-hidden="true" />
              )}
            </Button>
          </div>

          {/* Right under the action it is an alternative to. */}
          <Button variant="link" asChild className="px-0 text-muted-foreground">
            <Link href="/registro/alta">¿Aún no eres socio? Dar de alta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
