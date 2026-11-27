"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMembershipFee } from "@/app/admin/(dashboard)/ajustes/actions";
import type { ActionResult } from "@/lib/actions";

type MembershipFeeFormProps = {
  currentFeeEuros: number;
};

const initialState: ActionResult = { success: false };

export function MembershipFeeForm({ currentFeeEuros }: MembershipFeeFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateMembershipFee,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="membershipFee">Cuota de socio (EUR)</Label>
        <Input
          id="membershipFee"
          name="membershipFee"
          type="number"
          step="0.01"
          min="0"
          defaultValue={currentFeeEuros.toFixed(2)}
          required
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600">
          Cuota actualizada correctamente
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
