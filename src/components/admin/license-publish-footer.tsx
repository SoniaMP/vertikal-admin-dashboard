"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { publishLicenseType } from "@/app/admin/(dashboard)/tipos-federacion/actions";

type Props = {
  licenseTypeId: string;
  canPublish: boolean;
  onPublished: () => void;
};

export function LicensePublishFooter({
  licenseTypeId,
  canPublish,
  onPublished,
}: Props) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishLicenseType(licenseTypeId);
      if (result.success) {
        onPublished();
        return;
      }
      setError(result.error);
    });
  }

  return (
    <div className="space-y-2 border-t pt-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Al publicarla, los socios podrán elegirla en el alta. Las modalidades
          que ya tengan precio se publican con ella.
        </p>
        <Button
          type="button"
          onClick={handlePublish}
          disabled={isPending || !canPublish}
          title={
            canPublish
              ? undefined
              : "Configura al menos un precio antes de publicar"
          }
        >
          {isPending ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </div>
  );
}
