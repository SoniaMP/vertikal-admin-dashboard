import { describe, it, expect } from "vitest";
import { render } from "@react-email/components";
import MembershipConfirmation from "../membership-confirmation";

const defaultProps = {
  firstName: "María",
  lastName: "García",
  email: "maria@example.com",
  licenseLabel: "Federativa — Adulto — Estándar" as string | null,
  externalLicenseLabel: null as string | null,
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

const memberOnlyProps = {
  ...defaultProps,
  licenseLabel: null,
  externalLicenseLabel: "FERM PLUS A",
  supplements: [],
  totalAmountCents: 2000,
};

describe("MembershipConfirmation — license obtained elsewhere", () => {
  it("drops the license row", async () => {
    const html = await render(MembershipConfirmation(memberOnlyProps));
    expect(html).not.toContain("Licencia</");
  });

  it("names the federation the member declared", async () => {
    const html = await render(MembershipConfirmation(memberOnlyProps));
    expect(html).toContain("FERM PLUS A");
  });

  it("says only the membership fee was charged", async () => {
    const html = await render(MembershipConfirmation(memberOnlyProps));
    expect(html).toContain("solo te hemos cobrado la cuota de socio");
    expect(html).toContain("20,00");
  });

  it("still reads correctly when no federation was given", async () => {
    const html = await render(
      MembershipConfirmation({
        ...memberOnlyProps,
        externalLicenseLabel: null,
      }),
    );
    expect(html).toContain("Tramitas tu licencia federativa por tu cuenta");
  });
});
