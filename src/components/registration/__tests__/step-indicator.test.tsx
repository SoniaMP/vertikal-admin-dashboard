// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

  it("keeps the decorative marks out of assistive tech", () => {
    // The numbered circles are gone: the axis marks carry the progress
    // visually and the sr-only line above carries it in words.
    const { container } = render(
      <StepIndicator currentStep={1} steps={STEPS} />,
    );

    const marks = container.querySelectorAll(".step-mark");
    expect(marks).toHaveLength(STEPS.length);
    marks.forEach((mark) =>
      expect(mark.getAttribute("aria-hidden")).toBe("true"),
    );
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

describe("StepIndicator, navigable", () => {
  it("offers a way back to each step already completed", () => {
    const onStepSelect = vi.fn();
    render(
      <StepIndicator
        currentStep={3}
        steps={STEPS}
        onStepSelect={onStepSelect}
      />,
    );

    const backToFirst = screen.getByRole("button", {
      name: "Paso 1 de 4: Datos personales, completado",
    });
    fireEvent.click(backToFirst);

    expect(onStepSelect).toHaveBeenCalledWith(1);
  });

  it("offers no way to skip ahead, which would walk past the validation", () => {
    render(
      <StepIndicator currentStep={3} steps={STEPS} onStepSelect={() => {}} />,
    );

    // Only steps 1 and 2 are done at step 3.
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: /Paso 4 de 4/ }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: /paso actual/ }),
    ).toBeNull();
  });

  it("stays plain text when no handler is given", () => {
    render(<StepIndicator currentStep={3} steps={STEPS} />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
