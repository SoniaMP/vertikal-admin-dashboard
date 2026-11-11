"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { RegistrationInput } from "@/validations/registration";

type MembershipModeStepProps = {
  onNext: () => void;
  onBack: () => void;
};

const CLUB_MODE = "club";
const EXTERNAL_MODE = "external";

const MODE_OPTIONS = [
  {
    value: CLUB_MODE,
    title: "Quiero federarme con el Club Vertikal",
    description:
      "Tramitamos tu licencia. En el siguiente paso eliges tipo, categoría y suplementos.",
  },
  {
    value: EXTERNAL_MODE,
    title: "Ya tengo licencia en vigor",
    description:
      "Te das de alta solo como socio. Te pediremos el PDF de tu licencia para comprobar que está vigente.",
  },
];

// The field is a boolean but RadioGroup works on strings, and an unanswered
// step must leave both cards unselected rather than defaulting to one.
function toRadioValue(hasClubLicense: boolean | undefined) {
  if (hasClubLicense === undefined) return "";
  return hasClubLicense ? CLUB_MODE : EXTERNAL_MODE;
}

export function MembershipModeStep({
  onNext,
  onBack,
}: MembershipModeStepProps) {
  const form = useFormContext<RegistrationInput>();

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="hasClubLicense"
        render={({ field }) => (
          <FormItem>
            <h3 className="text-lg font-semibold">Licencia federativa</h3>
            <p className="text-sm text-muted-foreground">
              Elige cómo quieres tramitarla.
            </p>
            <FormControl>
              <RadioGroup
                value={toRadioValue(field.value)}
                // Revalidates on pick so the "choose an option" message clears
                // as soon as the member actually picks one.
                onValueChange={(value) =>
                  form.setValue("hasClubLicense", value === CLUB_MODE, {
                    shouldValidate: true,
                  })
                }
                className="grid gap-3"
              >
                {MODE_OPTIONS.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <Card
                      className={cn(
                        "transition-colors",
                        toRadioValue(field.value) === option.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50",
                      )}
                    >
                      <CardContent className="flex items-start gap-3 p-4">
                        <RadioGroupItem value={option.value} className="mt-1" />
                        <div className="flex-1">
                          <span className="text-base font-bold">
                            {option.title}
                          </span>
                          <p className="mt-1 text-sm font-normal text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </label>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Anterior
        </Button>
        <Button type="button" onClick={onNext}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
