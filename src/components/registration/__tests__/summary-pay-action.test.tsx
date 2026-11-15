// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SummaryPayAction } from "../summary-pay-action";

const PAY = "Proceder al pago";

describe("SummaryPayAction", () => {
  it("keeps the pay button usable while something is missing", () => {
    const onPay = vi.fn();
    render(
      <SummaryPayAction
        blocker={null}
        isSubmitting={false}
        onBack={() => {}}
        onPay={onPay}
      />,
    );

    const button = screen.getByRole("button", { name: PAY });
    expect(button.hasAttribute("disabled")).toBe(false);
    fireEvent.click(button);
    expect(onPay).toHaveBeenCalledOnce();
  });

  it("announces the reason and ties it to the button", () => {
    render(
      <SummaryPayAction
        blocker={{ target: "consent", message: "Marca la casilla" }}
        isSubmitting={false}
        onBack={() => {}}
        onPay={() => {}}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Marca la casilla");
    expect(
      screen.getByRole("button", { name: PAY }).getAttribute("aria-describedby"),
    ).toBe(alert.id);
  });

  it("names the way out when the license is the problem", () => {
    render(
      <SummaryPayAction
        blocker={{ target: "license", message: "Sin precio" }}
        isSubmitting={false}
        onBack={() => {}}
        onPay={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Cambiar la licencia" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Anterior" })).toBeNull();
  });

  it("only blocks the button while the payment is being created", () => {
    render(
      <SummaryPayAction
        blocker={null}
        isSubmitting
        onBack={() => {}}
        onPay={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Procesando..." }).hasAttribute("disabled"),
    ).toBe(true);
  });
});
