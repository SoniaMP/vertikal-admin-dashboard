"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/app/admin/(dashboard)/cuenta/actions";

const INITIAL_STATE = { success: false, error: undefined };

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePassword,
    INITIAL_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
        />
      </div>
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">Contraseña actualizada</p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
