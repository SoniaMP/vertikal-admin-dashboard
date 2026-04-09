"use client";

import {
  startTransition,
  SyntheticEvent,
  useActionState,
  useEffect,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { addEnrollee } from "@/app/admin/(dashboard)/cursos/actions";

export type PriceOption = { id: string; name: string; amountCents: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  prices: PriceOption[];
};

const INITIAL_STATE = { success: false, error: undefined };

export function AddEnrolleeDialog({
  open,
  onOpenChange,
  courseId,
  prices,
}: Props) {
  const action = addEnrollee.bind(null, courseId);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [isExtraOpen, setIsExtraOpen] = useState(false);

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state, onOpenChange]);

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir participante</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RequiredFields prices={prices} />
          <Collapsible open={isExtraOpen} onOpenChange={setIsExtraOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExtraOpen ? "rotate-180" : ""}`}
                />
                Datos adicionales
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <OptionalFields />
            </CollapsibleContent>
          </Collapsible>
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
              {isPending ? "Añadiendo..." : "Añadir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RequiredFields({ prices }: { prices: PriceOption[] }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" name="firstName" required />
        <Field label="Apellidos" name="lastName" required />
      </div>
      <Field label="Email" name="email" type="email" required />
      <div className="space-y-1.5">
        <Label>Tarifa *</Label>
        <div className="space-y-1">
          {prices.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="coursePriceId"
                value={p.id}
                required
                className="accent-primary"
              />
              {p.name} — {formatCents(p.amountCents)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function OptionalFields() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="DNI" name="dni" />
        <Field label="Fecha de nacimiento" name="dateOfBirth" type="date" />
      </div>
      <Field label="Teléfono" name="phone" type="tel" />
      <Field label="Dirección" name="address" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Ciudad" name="city" />
        <Field label="Código postal" name="postalCode" />
        <Field label="Provincia" name="province" />
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
};

function Field({ label, name, type = "text", required }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && " *"}
      </Label>
      <Input id={name} name={name} type={type} required={required} />
    </div>
  );
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
