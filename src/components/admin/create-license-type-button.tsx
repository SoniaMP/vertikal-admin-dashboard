"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LicenseTypeFormDialog } from "./license-type-form-dialog";

type Props = {
  seasonId: string;
};

export function CreateLicenseTypeButton({ seasonId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Nuevo tipo
      </Button>
      <LicenseTypeFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        seasonId={seasonId}
      />
    </>
  );
}
