import type { RegistrationStep } from "@/helpers/registration-steps";

type StepState = {
  step: RegistrationStep;
  totalSteps: number;
  currentStep: number;
};

/**
 * What a screen reader should hear for one step of the wizard.
 *
 * The circles say "✓", "✓", "3", "4" on screen, which read out as exactly
 * that: no name, no position, no idea what is done. This spells it out, and
 * `aria-current` on the same item marks which one the member is on.
 */
export function stepStatusLabel({
  step,
  totalSteps,
  currentStep,
}: StepState): string {
  const name = `Paso ${step.number} de ${totalSteps}: ${step.label}`;

  if (currentStep > step.number) return `${name}, completado`;
  if (currentStep === step.number) return `${name}, paso actual`;
  return `${name}, pendiente`;
}
