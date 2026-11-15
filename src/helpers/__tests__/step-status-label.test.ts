import { describe, it, expect } from "vitest";
import { stepStatusLabel } from "../step-status-label";

const STEP = { number: 2, label: "Licencia" };

describe("stepStatusLabel", () => {
  it("names the step and where it sits", () => {
    expect(stepStatusLabel({ step: STEP, totalSteps: 4, currentStep: 2 })).toBe(
      "Paso 2 de 4: Licencia, paso actual",
    );
  });

  it("marks a step already behind the member", () => {
    expect(stepStatusLabel({ step: STEP, totalSteps: 4, currentStep: 3 })).toBe(
      "Paso 2 de 4: Licencia, completado",
    );
  });

  it("marks a step still ahead", () => {
    expect(stepStatusLabel({ step: STEP, totalSteps: 4, currentStep: 1 })).toBe(
      "Paso 2 de 4: Licencia, pendiente",
    );
  });
});
