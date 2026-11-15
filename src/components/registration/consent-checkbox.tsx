"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataProtectionDialog } from "./data-protection-dialog";

type ConsentCheckboxProps = {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Lets the pay action send focus here when this is what is missing. */
  focusRef?: React.Ref<HTMLButtonElement>;
};

export function ConsentCheckbox({
  isChecked,
  onCheckedChange,
  focusRef,
}: ConsentCheckboxProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
        <Checkbox
          ref={focusRef}
          checked={isChecked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm leading-snug">
          He leído y acepto la{" "}
          <button
            type="button"
            className="text-primary underline underline-offset-2 hover:opacity-80"
            onClick={(e) => {
              e.preventDefault();
              setIsDialogOpen(true);
            }}
          >
            Política de Privacidad
          </button>{" "}
          y consiento el tratamiento de mis datos personales conforme al RGPD.
        </span>
      </label>

      <DataProtectionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
