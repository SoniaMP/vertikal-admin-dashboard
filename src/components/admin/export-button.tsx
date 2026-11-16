"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Exports what the screen is showing, filters and all. */
export function ExportButton() {
  const searchParams = useSearchParams();

  return (
    <Button variant="outline" asChild>
      <a href={`/admin/export?${searchParams.toString()}`} download>
        <Download aria-hidden="true" />
        Exportar
      </a>
    </Button>
  );
}
