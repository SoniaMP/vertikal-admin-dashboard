"use client";

import { useState } from "react";

export type LicenseUploadState = "idle" | "uploading" | "success" | "error";

/**
 * Drives the PDF upload used to prove a federation license. It is form
 * agnostic: the caller receives the stored path through `onUploaded` and
 * decides which field it belongs to.
 */
export function useLicensePdfUpload(onUploaded: (url: string) => void) {
  const [uploadState, setUploadState] = useState<LicenseUploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function uploadFile(file: File) {
    setUploadState("uploading");
    setErrorMessage("");

    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();

      if (!response.ok) {
        setUploadState("error");
        setErrorMessage(data.error ?? "Error al subir el archivo");
        return;
      }

      onUploaded(data.url);
      setUploadState("success");
    } catch {
      setUploadState("error");
      setErrorMessage("Error de conexión al subir el archivo");
    }
  }

  return { uploadState, errorMessage, uploadFile };
}
