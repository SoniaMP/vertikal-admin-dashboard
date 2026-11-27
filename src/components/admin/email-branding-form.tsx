"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEmailBranding } from "@/app/admin/(dashboard)/ajustes/actions";
import type { ActionResult } from "@/lib/actions";
import type { EmailBrandingSettings } from "@/lib/email-branding";
import { LogoUploader } from "./logo-uploader";

type EmailBrandingFormProps = {
  branding: EmailBrandingSettings;
};

const initialState: ActionResult = { success: false };

export function EmailBrandingForm({ branding }: EmailBrandingFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateEmailBranding,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || "");

  return (
    <form ref={formRef} action={formAction} className="max-w-sm space-y-4">
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <LogoUploader currentLogoUrl={branding.logoUrl} onUploaded={setLogoUrl} />

      <ColorField
        label="Color primario (cabecera/botones)"
        name="primaryColor"
        defaultValue={branding.primaryColor}
      />
      <ColorField
        label="Color secundario (acentos)"
        name="secondaryColor"
        defaultValue={branding.secondaryColor}
      />
      <ColorField
        label="Color de fondo"
        name="backgroundColor"
        defaultValue={branding.backgroundColor}
      />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600">
          Configuración de email actualizada
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}

type ColorFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
};

function ColorField({ label, name, defaultValue }: ColorFieldProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          id={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-input"
        />
        <Input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          pattern="^#[0-9a-fA-F]{6}$"
          maxLength={7}
          className="w-28 font-mono"
          required
        />
      </div>
    </div>
  );
}
