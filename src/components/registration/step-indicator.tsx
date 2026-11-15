"use client";

import { cn } from "@/lib/utils";
import { stepStatusLabel } from "@/helpers/step-status-label";
import type { RegistrationStep } from "@/helpers/registration-steps";

type StepIndicatorProps = {
  currentStep: number;
  steps: RegistrationStep[];
};

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  const currentLabel = steps.find((s) => s.number === currentStep)?.label;

  return (
    <nav aria-label="Progreso del registro" className="-mx-6 px-6 pb-6">
      {/* A phone has no room for four labels under four circles, so the step
          the member is on says its name and its place, once, above them. The
          same words reach a screen reader through each item below. */}
      <p aria-hidden="true" className="mb-3 text-sm sm:hidden">
        <span className="text-muted-foreground">
          Paso {currentStep} de {steps.length}
        </span>
        {currentLabel && (
          <span className="font-medium text-primary"> · {currentLabel}</span>
        )}
      </p>

      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <li
              key={step.number}
              aria-current={isCurrent ? "step" : undefined}
              className="flex flex-1 items-center"
            >
              <span className="sr-only">
                {stepStatusLabel({
                  step,
                  totalSteps: steps.length,
                  currentStep,
                })}
              </span>
              <div className="flex flex-col items-center gap-2">
                <div
                  aria-hidden="true"
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {isCompleted ? "✓" : step.number}
                </div>
                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isCurrent ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    // No label under the circles on a phone, so no room to
                    // leave for one: the line centers on the circles instead.
                    "mx-2 mb-0 h-0.5 flex-1 sm:mb-6",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/30",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
