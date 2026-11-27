"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LogoUploaderProps = {
  currentLogoUrl: string | null;
  onUploaded: (url: string) => void;
};

export function LogoUploader({
  currentLogoUrl,
  onUploaded,
}: LogoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(currentLogoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload/branding", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al subir la imagen");
        return;
      }

      setPreviewUrl(data.url);
      onUploaded(data.url);
    } catch {
      setError("Error de conexión al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>Logo del email</Label>
      {previewUrl && (
        <Image
          src={previewUrl}
          alt="Logo preview"
          width={160}
          height={64}
          className="h-16 w-auto rounded border border-gray-200 p-1"
          unoptimized
        />
      )}
      <Input
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading && (
        <p className="text-sm text-muted-foreground">Subiendo...</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
