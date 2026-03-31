import { describe, it, expect } from "vitest";
import { render } from "@react-email/components";
import MembershipConfirmation from "../membership-confirmation";

const defaultProps = {
  firstName: "María",
  lastName: "García",
  email: "maria@example.com",
  licenseLabel: "Federativa — Adulto — Estándar",
  totalAmountCents: 8500,
  supplements: ["Seguro RC extra", "Alquiler taquilla"],
  seasonName: "2025-2026",
};

describe("MembershipConfirmation", () => {
  it("renders the member name", async () => {
    const html = await render(MembershipConfirmation(defaultProps));
    expect(html).toContain("María");
    expect(html).toContain("García");
  });

  it("renders welcome message", async () => {
    const html = await render(MembershipConfirmation(defaultProps));
    expect(html).toContain("Bienvenido/a a Club Vertikal");
  });

  it("renders license label and season", async () => {
    const html = await render(MembershipConfirmation(defaultProps));
    expect(html).toContain("Federativa — Adulto — Estándar");
    expect(html).toContain("2025-2026");
  });

  it("renders supplements", async () => {
    const html = await render(MembershipConfirmation(defaultProps));
    expect(html).toContain("Seguro RC extra");
    expect(html).toContain("Alquiler taquilla");
  });

  it("renders formatted total price", async () => {
    const html = await render(MembershipConfirmation(defaultProps));
    expect(html).toContain("85,00");
  });

  it("renders without supplements", async () => {
    const html = await render(
      MembershipConfirmation({ ...defaultProps, supplements: [] }),
    );
    expect(html).not.toContain("Suplementos");
  });
});
