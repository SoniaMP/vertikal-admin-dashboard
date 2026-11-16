"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WizardExitButton, type WizardExit } from "./wizard-exit-button";
import type { PayBlocker } from "@/helpers/pay-block-reason";

const BLOCKER_ID = "pay-blocker";

type SummaryPayActionProps = {
  blocker: PayBlocker | null;
  isSubmitting: boolean;
  onBack: () => void;
  onPay: () => void;
  /** Shown beside "Anterior" when the flow offers a way out of itself. */
  exit?: WizardExit;
};

export function SummaryPayAction({
  blocker,
  isSubmitting,
  onBack,
  onPay,
  exit,
}: SummaryPayActionProps) {
  const isLicenseBlocked = blocker?.target === "license";

  return (
    <div className="space-y-3 pt-4">
      {blocker && (
        <p id={BLOCKER_ID} role="alert" className="text-sm text-destructive">
          {blocker.message}
        </p>
      )}
      <div className="flex justify-between gap-3">
        {/* Both labels step back to the license step, which is the one before
            this; the wording only changes when that step is the thing the
            member has to go and fix. */}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            {isLicenseBlocked ? "Cambiar la licencia" : "Anterior"}
          </Button>
          {exit && <WizardExitButton exit={exit} />}
        </div>
        <Button
          type="button"
          onClick={onPay}
          disabled={isSubmitting}
          aria-describedby={blocker ? BLOCKER_ID : undefined}
        >
          {isSubmitting ? "Procesando..." : "Proceder al pago"}
        </Button>
      </div>
    </div>
  );
}
