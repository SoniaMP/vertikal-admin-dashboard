// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RenewalLookup } from "../renewal-lookup";

vi.mock("@/app/registro/renewal-actions", () => ({
  requestRenewalCode: vi.fn(),
  redeemRenewalCode: vi.fn(),
}));

function renderLookup(onSkip = () => {}) {
  render(<RenewalLookup onVerified={() => {}} onSkip={onSkip} />);
}

describe("RenewalLookup", () => {
  it("puts the way back where every step of the flow keeps it", () => {
    renderLookup();

    const back = screen.getByRole("link", { name: "Volver" });
    expect(back.getAttribute("href")).toBe("/registro");
    expect(back.closest("div")?.textContent).toContain("Enviarme un código");
  });

  it("never traps a member who cannot read the code", () => {
    const onSkip = vi.fn();
    renderLookup(onSkip);

    fireEvent.click(
      screen.getByRole("button", { name: "Continuar sin recuperar mis datos" }),
    );

    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("points someone who is not a member yet at the alta", () => {
    renderLookup();

    expect(
      screen
        .getByRole("link", { name: "¿Aún no eres socio? Dar de alta" })
        .getAttribute("href"),
    ).toBe("/registro/alta");
  });

  it("asks for the code on the same screen, not in a new one", () => {
    renderLookup();

    expect(
      screen.getByLabelText("DNI, NIE o pasaporte del socio"),
    ).toBeTruthy();
  });
});
