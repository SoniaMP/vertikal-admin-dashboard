"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSeasonRolloverDays } from "@/app/admin/(dashboard)/ajustes/actions";
import type { ActionResult } from "@/lib/actions";

type Props = {
  currentDays: number;
  /** The window the saved number works out to, worked out on the server. */
  windowLabel: string;
};

const INITIAL_STATE: ActionResult = { success: false };

export function SeasonRolloverForm({ currentDays, windowLabel }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateSeasonRolloverDays,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rolloverDays">Días de antelación</Label>
        <Input
          id="rolloverDays"
          name="rolloverDays"
          type="number"
          step="1"
          min="0"
          max="120"
          defaultValue={currentDays}
          required
        />
        <p className="text-sm text-muted-foreground">{windowLabel}</p>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600">
          Guardado. Recarga para ver la fecha nueva.
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
