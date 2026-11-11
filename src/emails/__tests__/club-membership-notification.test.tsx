import { describe, it, expect } from "vitest";
import { render } from "@react-email/components";
import ClubMembershipNotification from "../club-membership-notification";
import type { MembershipNotificationProps } from "../types";

const clubLicenseProps: MembershipNotificationProps = {
  fullName: "Maria Garcia Lopez",
  dni: "12345678A",
  email: "maria@example.com",
  phone: "612345678",
  address: "Calle Mayor 10",
  city: "Madrid",
  postalCode: "28001",
  province: "Madrid",
  licenseLabel: "FERM - BASICA B - Adulto",
  externalLicense: null,
  supplements: ["Revista anual"],
  totalAmountCents: 8500,
  seasonName: "2025-2026",
};

const externalLicenseProps: MembershipNotificationProps = {
  ...clubLicenseProps,
  licenseLabel: null,
  externalLicense: {
    label: "FERM PLUS A",
    membershipUrl: "https://club.example.com/admin/registros/m-1",
  },
  supplements: [],
  totalAmountCents: 2000,
};

describe("ClubMembershipNotification", () => {
  it("lists the club license when the club issues it", async () => {
    const html = await render(ClubMembershipNotification(clubLicenseProps));
    expect(html).toContain("FERM - BASICA B - Adulto");
    expect(html).not.toContain("pendiente de verificar");
  });

  it("asks the admin to check a license obtained elsewhere", async () => {
    const html = await render(ClubMembershipNotification(externalLicenseProps));
    expect(html).toContain("pendiente de verificar");
    expect(html).toContain("FERM PLUS A");
  });

  it("links straight to the membership so the PDF is one click away", async () => {
    const html = await render(ClubMembershipNotification(externalLicenseProps));
    expect(html).toContain("https://club.example.com/admin/registros/m-1");
  });

  it("keeps the member details and the total on both branches", async () => {
    const html = await render(ClubMembershipNotification(externalLicenseProps));
    expect(html).toContain("12345678A");
    expect(html).toContain("20,00");
  });
});
