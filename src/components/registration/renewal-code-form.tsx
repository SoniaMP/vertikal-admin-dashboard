"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RENEWAL_CODE_LENGTH } from "@/validations/renewal";
import { redeemRenewalCode } from "@/app/registro/renewal-actions";
import type { RenewalPrefill } from "@/lib/renewal-prefill";

type RenewalCodeFormProps = {
  dni: string;
  onVerified: (prefill: RenewalPrefill) => void;
  onRestart: () => void;
};

const INVALID_MESSAGE =
  "El código no es correcto o ha caducado. Pide uno nuevo o continúa sin recuperar tus datos.";

export function RenewalCodeForm({
  dni,
  onVerified,
  onRestart,
}: RenewalCodeFormProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    setMessage(null);
    setIsChecking(true);
    try {
      const result = await redeemRenewalCode(dni, code);
      if (result.status === "ok") {
        onVerified(result.prefill);
        return;
      }
      setMessage(INVALID_MESSAGE);
      inputRef.current?.focus();
    } catch {
      setMessage(INVALID_MESSAGE);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Si ese DNI está en nuestros registros, acabamos de enviar un código de{" "}
        {RENEWAL_CODE_LENGTH} dígitos al correo del socio. Caduca en 15
        minutos.
      </p>

      <div className="space-y-2">
        <Label htmlFor="renewal-code">Código recibido</Label>
        <Input
          id="renewal-code"
          ref={inputRef}
          value={code}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={RENEWAL_CODE_LENGTH}
          aria-describedby={message ? "renewal-code-message" : undefined}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ""));
            if (message) setMessage(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>

      {message && (
        <p
          id="renewal-code-message"
          role="alert"
          className="text-sm text-destructive"
        >
          {message}
        </p>
      )}

      <div className="space-y-2">
        <Button onClick={handleSubmit} disabled={isChecking} className="w-full">
          {isChecking && <Loader2 className="mr-2 size-4 animate-spin" />}
          Recuperar mis datos
        </Button>
        <Button variant="ghost" onClick={onRestart} className="w-full">
          No me ha llegado, pedir otro código
        </Button>
      </div>
    </div>
  );
}
