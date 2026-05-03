"use client";

import { useRef, useState } from "react";
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
import type { CourseRegistrationCheckoutInput } from "@/validations/course";

type UploadState = "idle" | "uploading" | "success" | "error";

export function CourseLicenseUpload() {
  const form = useFormContext<CourseRegistrationCheckoutInput>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState("uploading");
    setErrorMessage("");

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setUploadState("error");
        setErrorMessage(data.error ?? "Error al subir el archivo");
        return;
      }

      form.setValue("licenseFileUrl", data.url, { shouldValidate: true });
      setUploadState("success");
    } catch {
      setUploadState("error");
      setErrorMessage("Error de conexión al subir el archivo");
    }
  }

  return (
    <>
      <FormField
        control={form.control}
        name="licenseType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>FEDERACIÓN + Tipo de federativa</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: FERM PLUS A, FERM PLUS B, ..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="licenseFileUrl"
        render={() => (
          <FormItem>
            <FormLabel>Licencia federativa (PDF)</FormLabel>
            <div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={uploadState === "uploading"}
                className="w-full justify-start gap-2"
              >
                {uploadState === "uploading" && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {uploadState === "success" && (
                  <FileCheck className="size-4 text-green-600" />
                )}
                {uploadState === "error" && (
                  <AlertCircle className="size-4 text-destructive" />
                )}
                {uploadState === "idle" && <Upload className="size-4" />}
                {uploadState === "uploading" && "Subiendo..."}
                {uploadState === "success" && "Licencia subida"}
                {uploadState === "error" && "Error — Reintentar"}
                {uploadState === "idle" && "Sube tu licencia aquí"}
              </Button>
            </div>
            {uploadState === "error" && errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
