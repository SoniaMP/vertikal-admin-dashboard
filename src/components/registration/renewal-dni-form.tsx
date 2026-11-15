"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dniSchema } from "@/validations/registration";
import { requestRenewalCode } from "@/app/registro/renewal-actions";

type RenewalDniFormProps = {
  onCodeSent: (dni: string) => void;
};

const MESSAGES = {
  invalid_dni:
    "Documento no válido. Son de 5 a 20 letras y números, sin espacios ni guiones.",
  rate_limited:
    "Ya se han pedido varios códigos para este DNI. Espera una hora, o continúa sin recuperar tus datos.",
  error: "No hemos podido enviar el código. Inténtalo de nuevo.",
};

export function RenewalDniForm({ onCodeSent }: RenewalDniFormProps) {
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

      <Button onClick={handleSubmit} disabled={isSending} className="w-full">
        {isSending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Enviarme un código
      </Button>
    </div>
  );
}
