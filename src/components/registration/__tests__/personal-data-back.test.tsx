// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { PersonalDataForm } from "../personal-data-form";
import type { WizardExit } from "../wizard-exit-button";
import type { RegistrationInput } from "@/validations/registration";

const BACK_EXIT: WizardExit = {
  href: "/registro",
  label: "Volver",
  kind: "back",
};

function Harness({ exit }: { exit?: WizardExit }) {
  const form = useForm<RegistrationInput>();
  return (
    <FormProvider {...form}>
      <PersonalDataForm onNext={() => {}} exit={exit} />
    </FormProvider>
  );
}

describe("PersonalDataForm way out", () => {
  it("lets the member return to the start of the process", () => {
    render(<Harness exit={BACK_EXIT} />);

    expect(
      screen.getByRole("link", { name: "Volver" }).getAttribute("href"),
    ).toBe("/registro");
  });

  it("stays silent when the flow offers no way out", () => {
    render(<Harness />);

    expect(screen.queryByRole("link", { name: "Volver" })).toBeNull();
  });

  it("keeps the way out where the later steps put theirs", () => {
    render(<Harness exit={BACK_EXIT} />);

    // Step 2 onwards pair "Anterior" and "Siguiente" in one justified row;
    // a lone "Siguiente" here would move the control the member just learned.
    const row = screen.getByRole("link", { name: "Volver" }).parentElement;
    expect(row?.className).toContain("justify-between");
    expect(row?.textContent).toContain("Siguiente");
  });

  it("carries the renewal's own words and mark", () => {
    render(
      <Harness
        exit={{
          href: "/registro",
          label: "Empezar de nuevo",
          kind: "restart",
        }}
      />,
    );

    const exit = screen.getByRole("link", { name: "Empezar de nuevo" });
    // A house, not an arrow: this drops recovered data rather than stepping
    // one screen back.
    expect(exit.querySelector("svg")?.getAttribute("class")).toContain(
      "lucide-house",
    );
  });
});
