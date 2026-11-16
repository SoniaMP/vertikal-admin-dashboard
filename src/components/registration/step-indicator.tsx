"use client";

import { cn } from "@/lib/utils";
import { stepStatusLabel } from "@/helpers/step-status-label";
import type { RegistrationStep } from "@/helpers/registration-steps";

type StepIndicatorProps = {
  currentStep: number;
  steps: RegistrationStep[];
  /**
   * Makes the steps already completed clickable. Only backwards: jumping
   * forward would walk past the validation of everything in between.
   */
  onStepSelect?: (step: number) => void;
};

type StepState = "done" | "current" | "upcoming";

function stepState(step: RegistrationStep, currentStep: number): StepState {
  if (currentStep > step.number) return "done";
  if (currentStep === step.number) return "current";
  return "upcoming";
}

/**
 * The steps hang from the axis: a column beside the form on a desktop, a rail
 * above it on a phone, where height is the scarce dimension. The marks are
 * filled blocks rather than numbered circles, so the one shape of the page
 * carries the progress too.
 */
export function StepIndicator({
  currentStep,
  steps,
  onStepSelect,
}: StepIndicatorProps) {
  const current = steps.find((step) => step.number === currentStep);

  return (
    <nav aria-label="Progreso del registro">
      <ol className="step-axis">
        {steps.map((step) => {
          const state = stepState(step, currentStep);
          const label = stepStatusLabel({
            step,
            totalSteps: steps.length,
            currentStep,
          });
          const canGoBack = state === "done" && onStepSelect !== undefined;

          return (
            <li
              key={step.number}
              className="step-item"
              data-state={state}
              aria-current={state === "current" ? "step" : undefined}
            >
              {canGoBack ? (
                // Covers the whole item, so the target is the row and not the
                // four-pixel label, and the mark keeps its own place.
                <button
                  type="button"
                  className="step-link"
                  onClick={() => onStepSelect(step.number)}
                >
                  <span className="sr-only">{label}</span>
                </button>
              ) : (
                <span className="sr-only">{label}</span>
              )}
              <span aria-hidden="true" className="step-mark" />
              <span
                aria-hidden="true"
                className={cn(
                  "step-label block leading-tight",
                  state === "current"
                    ? "font-semibold text-primary"
                    : "font-medium text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <p aria-hidden="true" className="step-now text-sm">
        <span className="text-muted-foreground">
          Paso {currentStep} de {steps.length}
        </span>
        {current && (
          <span className="font-semibold text-primary"> · {current.label}</span>
        )}
      </p>
    </nav>
  );
}
