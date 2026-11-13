"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishSubtype } from "@/app/admin/(dashboard)/tipos-federacion/actions";

type Props = {
  subtypeId: string;
  hasPrices: boolean;
};

export function SubtypePublishButton({ subtypeId, hasPrices }: Props) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishSubtype(subtypeId);
      if (!result.success) setError(result.error);
    });
  }

  return (
    <>
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handlePublish}
        disabled={isPending || !hasPrices}
        className="h-7"
        title={
          hasPrices
            ? "Publicar esta modalidad"
            : "Configura al menos un precio antes de publicar"
        }
      >
        <Send className="h-3 w-3 mr-1" />
        {isPending ? "Publicando..." : "Publicar"}
      </Button>
    </>
  );
}
