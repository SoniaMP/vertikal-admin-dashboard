"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EmailChipInput } from "@/components/admin/email-chip-input";
import { updateNotificationEmails } from "@/app/admin/(dashboard)/ajustes/actions";
import type { ActionResult } from "@/lib/actions";

type NotificationEmailsFormProps = {
  settingKey: "membership" | "course";
  label: string;
  initialEmails: string[];
};

const initialState: ActionResult = { success: false };

export function NotificationEmailsForm({
  settingKey,
  label,
  initialEmails,
}: NotificationEmailsFormProps) {
  const [emails, setEmails] = useState(initialEmails);
  const [state, formAction, isPending] = useActionState(
    updateNotificationEmails,
    initialState,
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <input type="hidden" name="type" value={settingKey} />
      <input type="hidden" name="emails" value={JSON.stringify(emails)} />

      <div className="space-y-2">
        <Label>{label}</Label>
        <EmailChipInput value={emails} onChange={setEmails} />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">Guardado correctamente</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
