"use client";

import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Upload, FileCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useLicensePdfUpload } from "@/hooks/use-license-pdf-upload";
import type { RegistrationInput } from "@/validations/registration";

type ExternalLicenseStepProps = {
  onNext: () => void;
  onBack: () => void;
};

const UPLOAD_LABELS = {
  idle: "Sube tu licencia aquí",
  uploading: "Subiendo...",
  success: "Licencia subida",
  error: "Error — Reintentar",
};

function UploadIcon({ state }: { state: keyof typeof UPLOAD_LABELS }) {
  if (state === "uploading") return <Loader2 className="size-4 animate-spin" />;
  if (state === "success") {
    return <FileCheck className="size-4 text-green-600" />;
  }
  if (state === "error") return <AlertCircle className="size-4" />;
  return <Upload className="size-4" />;
}

export function ExternalLicenseStep({
  onNext,
  onBack,
}: ExternalLicenseStepProps) {
  const form = useFormContext<RegistrationInput>();
  const inputRef = useRef<HTMLInputElement>(null);

  const { uploadState, errorMessage, uploadFile } = useLicensePdfUpload((url) =>
    form.setValue("externalLicenseFileUrl", url, { shouldValidate: true }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Tu licencia federativa</h3>
        <p className="text-sm text-muted-foreground">
          Para practicar con el club necesitas una licencia federativa en vigor.
          Sube el PDF de la tuya para que podamos comprobarlo.
        </p>
      </div>

      <FormField
        control={form.control}
        name="externalLicenseLabel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>FEDERACIÓN + Tipo de federativa</FormLabel>
            <FormControl>
              {/* Revalidates as the member types so the error clears once the
                  field is filled, instead of lingering until the next step. */}
              <Input
                placeholder="Ej: FERM PLUS A"
                {...field}
                onChange={(event) =>
                  form.setValue("externalLicenseLabel", event.target.value, {
                    shouldValidate: true,
                  })
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="externalLicenseFileUrl"
        render={() => (
          <FormItem>
            <FormLabel>Licencia federativa (PDF)</FormLabel>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploadState === "uploading"}
              className="w-full justify-start gap-2"
            >
              <UploadIcon state={uploadState} />
              {UPLOAD_LABELS[uploadState]}
            </Button>
            {uploadState === "error" && errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Anterior
        </Button>
        <Button type="button" onClick={onNext}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
