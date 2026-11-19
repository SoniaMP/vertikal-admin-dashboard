"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataProtectionDialog } from "./data-protection-dialog";
import type { PrivacyConsent } from "@/hooks/use-privacy-consent";

const HINT_ID = "privacy-policy-hint";

type ConsentCheckboxProps = {
  consent: PrivacyConsent;
  /** Lets the pay action send focus here when the tick is what is missing. */
  focusRef?: React.Ref<HTMLButtonElement>;
  /** Focused instead while the box is disabled, which cannot take focus. */
  policyRef?: React.Ref<HTMLButtonElement>;
};

/**
 * The RGPD box of every public flow: membership, renewal and course.
 *
 * The box stays disabled until the policy has been opened once, so nobody
 * accepts a text they were never shown. The dialog is opened from the link
 * rather than from the box itself: ticking on close would record "I have read
 * and accept" when all the member did was dismiss a window.
 */
export function ConsentCheckbox({
  consent,
  focusRef,
  policyRef,
}: ConsentCheckboxProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isChecked, hasOpenedPolicy, accept, markPolicyOpened } = consent;

  // Radix only reports `onOpenChange` for moves it makes itself, and this
  // dialog has no trigger of its own, so the opening is recorded here.
  function openPolicy() {
    markPolicyOpened();
    setIsDialogOpen(true);
  }

  return (
    <>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
        <Checkbox
          ref={focusRef}
          checked={isChecked}
          disabled={!hasOpenedPolicy}
          aria-describedby={hasOpenedPolicy ? undefined : HINT_ID}
          onCheckedChange={(value) => accept(value === true)}
          className="mt-0.5"
        />
        <span className="text-sm leading-snug">
          He leído y acepto la{" "}
          <button
            ref={policyRef}
            type="button"
            className="text-primary underline underline-offset-2 hover:opacity-80"
            onClick={(event) => {
              event.preventDefault();
              openPolicy();
            }}
          >
            Política de Privacidad
          </button>{" "}
          y consiento el tratamiento de mis datos personales conforme al RGPD.
          {!hasOpenedPolicy && (
            <span id={HINT_ID} className="mt-1 block text-muted-foreground">
              Abre la Política de Privacidad para poder aceptarla.
            </span>
          )}
        </span>
      </label>

      <DataProtectionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
