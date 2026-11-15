// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { PersonalDataForm } from "../personal-data-form";
import type { RegistrationInput } from "@/validations/registration";

function Harness() {
  const form = useForm<RegistrationInput>();
  return (
    <FormProvider {...form}>
      <PersonalDataForm onNext={() => {}} />
    </FormProvider>
  );
}

// The point of the tokens is that a phone can fill all of this in one tap, so
// the test reads the rendered attributes rather than the map behind them.
const EXPECTED: [string, string][] = [
  ["Nombre", "given-name"],
  ["Apellidos", "family-name"],
  ["DNI", "off"],
  ["Fecha de nacimiento", "bday"],
  ["Email", "email"],
  ["Teléfono", "tel"],
  ["Dirección", "street-address"],
  ["Ciudad", "address-level2"],
  ["Código postal", "postal-code"],
  ["Provincia", "address-level1"],
];

describe("PersonalDataForm autofill", () => {
  it.each(EXPECTED)("marks %s as %s", (label, token) => {
    render(<Harness />);
    expect(screen.getByLabelText(label).getAttribute("autocomplete")).toBe(
      token,
    );
  });

  it("asks for a numeric keypad on the postal code", () => {
    render(<Harness />);
    expect(
      screen.getByLabelText("Código postal").getAttribute("inputmode"),
    ).toBe("numeric");
  });

  it("leaves every field with some autocomplete value, never unset", () => {
    render(<Harness />);
    const inputs = screen.getAllByRole("textbox");
    for (const input of inputs) {
      expect(input.getAttribute("autocomplete")).toBeTruthy();
    }
  });
});
