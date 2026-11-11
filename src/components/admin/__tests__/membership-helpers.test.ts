import { describe, it, expect } from "vitest";
import { licenseLabel } from "../membership-helpers";
import type { MembershipRow } from "../memberships-table";

function buildRow(overrides: Partial<MembershipRow>): MembershipRow {
  return {
    id: "m-1",
    status: "ACTIVE",
    paymentStatus: "COMPLETED",
    isFederated: false,
    hasClubLicense: true,
    externalLicenseLabel: null,
    externalLicenseFileUrl: null,
    externalLicenseVerifiedAt: null,
    totalAmount: 2000,
    createdAt: new Date(),
    member: {
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria@example.com",
      phone: "612345678",
      dni: "12345678A",
      dateOfBirth: "1990-01-01",
      sex: "F",
      address: "Calle Mayor 10",
      city: "Madrid",
      postalCode: "28001",
      province: "Madrid",
    },
    type: null,
    subtype: null,
    ...overrides,
  };
}

describe("licenseLabel", () => {
  it("joins the club type and subtype", () => {
    const row = buildRow({
      type: { name: "FERM" },
      subtype: { name: "BASICA B" },
    });
    expect(licenseLabel(row)).toBe("FERM - BASICA B");
  });

  it("shows the federation the member typed in when they federate elsewhere", () => {
    const row = buildRow({
      hasClubLicense: false,
      externalLicenseLabel: "FERM PLUS A",
    });
    expect(licenseLabel(row)).toBe("FERM PLUS A");
  });

  // The field is free text, so a registrant can leave only whitespace behind.
  it("falls back to a generic label when the free text is blank", () => {
    const row = buildRow({ hasClubLicense: false, externalLicenseLabel: "  " });
    expect(licenseLabel(row)).toBe("Licencia externa");
  });

  it("never claims a missing club license is external", () => {
    expect(licenseLabel(buildRow({}))).toBe("Sin licencia");
  });
});
