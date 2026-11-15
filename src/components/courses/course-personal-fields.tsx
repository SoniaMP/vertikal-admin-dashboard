"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { autofillHints } from "@/helpers/autofill-hints";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { CourseRegistrationCheckoutInput } from "@/validations/course";

type FieldName = keyof CourseRegistrationCheckoutInput;

export function CoursePersonalFields() {
  return (
    <div className="space-y-6">
      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-semibold">Datos personales</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="firstName" label="Nombre" />
          <TextField name="lastName" label="Apellidos" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="dni" label="DNI" />
          <TextField name="dateOfBirth" label="Fecha de nacimiento" type="date" />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-semibold">Contacto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="email" label="Email" type="email" />
          <TextField name="phone" label="Teléfono" type="tel" />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-semibold">Dirección</legend>
        <TextField name="address" label="Dirección" />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField name="city" label="Ciudad" />
          <TextField name="postalCode" label="Código postal" />
          <TextField name="province" label="Provincia" />
        </div>
      </fieldset>
    </div>
  );
}

type TextFieldProps = {
  name: FieldName;
  label: string;
  type?: string;
};

function TextField({ name, label, type = "text" }: TextFieldProps) {
  const form = useFormContext<CourseRegistrationCheckoutInput>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              {...autofillHints(name)}
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
