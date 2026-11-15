// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "../step-indicator";
import { buildRegistrationSteps } from "@/helpers/registration-steps";

const STEPS = buildRegistrationSteps(true);

/** What a screen reader would announce for each circle, in order. */
function announcedSteps(): string[] {
  return screen
    .getAllByRole("listitem")
    .map((item) => item.querySelector(".sr-only")?.textContent ?? "");
}

describe("StepIndicator", () => {
  it("marks the step the member is on, and only that one", () => {
    render(<StepIndicator currentStep={3} steps={STEPS} />);

    const current = screen
      .getAllByRole("listitem")
      .filter((item) => item.getAttribute("aria-current") === "step");

    expect(current).toHaveLength(1);
    expect(current[0].textContent).toContain("Federativa");
  });

  it("spells out every step instead of leaving bare ticks and numbers", () => {
    render(<StepIndicator currentStep={3} steps={STEPS} />);

    expect(announcedSteps()).toEqual([
      "Paso 1 de 4: Datos personales, completado",
      "Paso 2 de 4: Licencia, completado",
      "Paso 3 de 4: Federativa, paso actual",
      "Paso 4 de 4: Resumen, pendiente",
    ]);
  });

  it("hides the decorative number from assistive tech", () => {
    render(<StepIndicator currentStep={1} steps={STEPS} />);
    const circle = screen.getByText("1");
    expect(circle.getAttribute("aria-hidden")).toBe("true");
  });

  it("says the position and the name where a phone can read it", () => {
    render(<StepIndicator currentStep={2} steps={STEPS} />);
    expect(screen.getByText("Paso 2 de 4")).toBeDefined();
    expect(screen.getByText("· Licencia")).toBeDefined();
  });

  it("counts the steps it is given, not four", () => {
    render(
      <StepIndicator
        currentStep={1}
        steps={[
          { number: 1, label: "Datos e inscripción" },
          { number: 2, label: "Resumen" },
        ]}
      />,
    );
    expect(screen.getByText("Paso 1 de 2")).toBeDefined();
  });
});
