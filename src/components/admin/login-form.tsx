"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/app/admin/login/actions";

/**
 * The login's own field and button sizes. The admin panel keeps its denser
 * scale everywhere else, so these stay here instead of in a shared rule.
 */
const FIELD_STYLES =
  "h-13 rounded-none border-0 bg-[var(--field)] px-3.5 text-[17px] shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-primary";

export function LoginForm({
  hasExpiredSession = false,
}: {
  hasExpiredSession?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: "",
  });

  return (
    <form action={formAction} className="mt-2 space-y-5">
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      {/* The `expired` flag stays in the URL while the form posts back to it,
          so a wrong password would otherwise show both messages at once. The
          credentials error is the one that answers what just happened. */}
      {hasExpiredSession && !state.error && (
        <p
          role="status"
          className="border-l-[3px] border-primary bg-[var(--field)] px-3.5 py-3 text-sm text-foreground"
        >
          Tu sesión ha caducado por inactividad. Vuelve a entrar.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={FIELD_STYLES}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={FIELD_STYLES}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-13 w-full rounded-none text-[17px]"
      >
        {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
