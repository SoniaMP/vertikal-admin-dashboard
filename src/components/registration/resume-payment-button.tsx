"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resumeMembershipCheckout } from "@/app/registro/cancelado/actions";

type ResumePaymentButtonProps = {
  membershipId: string;
};

export function ResumePaymentButton({
  membershipId,
}: ResumePaymentButtonProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setMessage(null);
    setIsOpening(true);
    try {
      const result = await resumeMembershipCheckout(membershipId);
      if (result.status === "ready") {
        window.location.href = result.url;
        return;
      }
      setMessage(result.message);
    } catch {
      setMessage("No se pudo abrir el pago. Inténtalo de nuevo.");
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <div className="w-full space-y-3">
      <Button
        onClick={handleClick}
        disabled={isOpening}
        size="lg"
        className="w-full"
      >
        {isOpening && <Loader2 className="mr-2 size-4 animate-spin" />}
        Volver al pago
      </Button>
      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
    </div>
  );
}
