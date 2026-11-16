"use client";

import { useState } from "react";
import { RenewalDniForm } from "./renewal-dni-form";
import { RenewalCodeForm } from "./renewal-code-form";
import type { RenewalPrefill } from "@/lib/renewal-prefill";

type RenewalLookupProps = {
  onVerified: (prefill: RenewalPrefill) => void;
  onSkip: () => void;
};

/**
 * The lookup sits straight on the sheet, like every other step. It used to be
 * a bordered card floating on it, which is the one thing the public flow's
 * restyle took out everywhere else.
 *
 * Both screens carry "Continuar sin recuperar mis datos" in their own button
 * row: nobody is ever stuck behind the code, and the way on belongs beside
 * the action it stands in for, not loose at the foot of the page.
 */
export function RenewalLookup({ onVerified, onSkip }: RenewalLookupProps) {
  const [dniAwaitingCode, setDniAwaitingCode] = useState<string | null>(null);

  if (dniAwaitingCode === null) {
    return (
      <RenewalDniForm
        onCodeSent={setDniAwaitingCode}
        onSkip={onSkip}
        backHref="/registro"
      />
    );
  }

  return (
    <RenewalCodeForm
      dni={dniAwaitingCode}
      onVerified={onVerified}
      onSkip={onSkip}
      onRestart={() => setDniAwaitingCode(null)}
    />
  );
}
