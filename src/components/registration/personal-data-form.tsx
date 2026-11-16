"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { autofillHints } from "@/helpers/autofill-hints";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { RegistrationInput } from "@/validations/registration";

type PersonalDataFormProps = {
  onNext: () => void;
};

export function PersonalDataForm({ onNext }: PersonalDataFormProps) {
  return (
    <div className="space-y-6">
      <fieldset className="space-y-5">
        <legend className="sr-only">Datos personales</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="firstName" label="Nombre" />
          <TextField name="lastName" label="Apellidos" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="dni" label="DNI" />
          <TextField name="dateOfBirth" label="Fecha de nacimiento" type="date" />
        </div>
        <SexField />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-primary">Contacto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="email" label="Email" type="email" />
          <TextField name="phone" label="Teléfono" type="tel" />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-primary">Dirección</legend>
        <TextField name="address" label="Dirección" />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField name="city" label="Ciudad" />
          <TextField name="postalCode" label="Código postal" />
          <TextField name="province" label="Provincia" />
        </div>
      </fieldset>

      <div className="flex justify-end pt-4">
        <Button type="button" onClick={onNext}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}

function SexField() {
  const form = useFormContext<RegistrationInput>();

  return (
    <FormField
      control={form.control}
      name="sex"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sexo</FormLabel>
          <FormControl>
            <RadioGroup
              value={typeof field.value === "string" ? field.value : ""}
              onValueChange={field.onChange}
              className="flex gap-6"
            >
              <label className="flex items-center gap-2">
                <RadioGroupItem value="M" />
                Hombre
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="F" />
                Mujer
              </label>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type TextFieldProps = {
  name: keyof RegistrationInput;
  label: string;
  type?: string;
  placeholder?: string;
};

function TextField({
  name,
  label,
  type = "text",
  placeholder,
}: TextFieldProps) {
  const form = useFormContext<RegistrationInput>();

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
              placeholder={placeholder}
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
