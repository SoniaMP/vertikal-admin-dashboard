"use client";

import { useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMembership } from "@/app/admin/(dashboard)/registros/membership-actions";
import { MemberFormFields } from "./member-form-fields";

export type MemberFormData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  dateOfBirth: string;
  sex: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  paymentStatus: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership: MemberFormData;
};

const INITIAL_STATE = { success: false, error: undefined };

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "COMPLETED", label: "Completado" },
  { value: "FAILED", label: "Fallido" },
  { value: "REFUNDED", label: "Reembolsado" },
];

export function MemberFormDialog({ open, onOpenChange, membership }: Props) {
  const action = updateMembership.bind(null, membership.id);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar miembro</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <MemberFormFields defaults={membership} />
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Estado de pago</Label>
            <Select
              name="paymentStatus"
              defaultValue={membership.paymentStatus}
            >
              <SelectTrigger id="paymentStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
