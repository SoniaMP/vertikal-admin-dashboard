import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

const mockOfferingFind = vi.fn();
const mockSupplementFindMany = vi.fn();
const mockMemberUpsert = vi.fn();
const mockMembershipCreate = vi.fn();
const mockMembershipUpdate = vi.fn();
const mockMembershipFindUnique = vi.fn();
const mockSessionCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    licenseOffering: {
      findFirst: (...args: unknown[]) => mockOfferingFind(...args),
    },
    supplement: {
      findMany: (...args: unknown[]) => mockSupplementFindMany(...args),
    },
    supplementPrice: { findMany: () => Promise.resolve([]) },
    supplementGroupPrice: { findMany: () => Promise.resolve([]) },
    member: { upsert: (...args: unknown[]) => mockMemberUpsert(...args) },
    membership: {
      create: (...args: unknown[]) => mockMembershipCreate(...args),
      update: (...args: unknown[]) => mockMembershipUpdate(...args),
      findUnique: (...args: unknown[]) => mockMembershipFindUnique(...args),
    },
    membershipSupplement: { deleteMany: () => Promise.resolve({ count: 0 }) },
  },
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: { create: (...args: unknown[]) => mockSessionCreate(...args) },
    },
  }),
}));

vi.mock("@/lib/settings", () => ({
  getMembershipFee: () => Promise.resolve(2000),
  getActiveSeason: () => Promise.resolve({ id: "season-1", name: "2025-2026" }),
}));

function createRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const PDF_URL = "/api/uploads/licenses/3f6a1b2c-0d4e-4f5a-9b8c-7d6e5f4a3b2c.pdf";

const memberOnlyBody = {
  firstName: "Lucia",
  lastName: "Fernandez Soto",
  email: "lucia@test.com",
  phone: "655443322",
  dni: "05566778P",
  dateOfBirth: "1992-07-03",
  sex: "F",
  address: "Avenida del Rocio 14",
  city: "Cartagena",
  postalCode: "30201",
  province: "Murcia",
  hasClubLicense: false,
  typeId: "",
  subtypeId: "",
  categoryId: "",
  supplementIds: [],
  externalLicenseLabel: "FERM PLUS A",
  externalLicenseFileUrl: PDF_URL,
};

function membershipData() {
  return mockMembershipCreate.mock.calls[0][0].data;
}

describe("POST /api/checkout — member only, license obtained elsewhere", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMemberUpsert.mockResolvedValue({ id: "member-1" });
    mockMembershipFindUnique.mockResolvedValue(null);
    mockMembershipCreate.mockResolvedValue({ id: "membership-1" });
    mockMembershipUpdate.mockResolvedValue({ id: "membership-1" });
    mockSessionCreate.mockResolvedValue({
      id: "cs_test_1",
      url: "https://checkout.stripe.com/c/pay/cs_test_1",
    });
  });

  it("charges the membership fee and nothing else", async () => {
    const response = await POST(createRequest(memberOnlyBody));

    expect(response.status).toBe(200);
    expect(membershipData().totalAmount).toBe(2000);
  });

  it("never looks for a license offering", async () => {
    await POST(createRequest(memberOnlyBody));

    expect(mockOfferingFind).not.toHaveBeenCalled();
  });

  it("bills a single line item for the fee", async () => {
    await POST(createRequest(memberOnlyBody));

    const { line_items: lineItems } = mockSessionCreate.mock.calls[0][0];
    expect(lineItems).toHaveLength(1);
    expect(lineItems[0].price_data.product_data.name).toBe("Cuota de socio");
    expect(lineItems[0].price_data.unit_amount).toBe(2000);
  });

  it("stores the external license and leaves the club fields empty", async () => {
    await POST(createRequest(memberOnlyBody));

    expect(membershipData()).toMatchObject({
      hasClubLicense: false,
      typeId: null,
      subtypeId: null,
      categoryId: null,
      offeringId: null,
      externalLicenseLabel: "FERM PLUS A",
      externalLicenseFileUrl: PDF_URL,
    });
  });

  // Reporting reads `licensePriceSnapshot > 0` as "this member paid us for a
  // federation license", so it has to stay at zero on this branch.
  it("keeps the license snapshots empty", async () => {
    await POST(createRequest(memberOnlyBody));

    expect(membershipData()).toMatchObject({
      licensePriceSnapshot: 0,
      licenseLabelSnapshot: "",
    });
  });

  it("ignores supplements sent on this branch", async () => {
    await POST(
      createRequest({ ...memberOnlyBody, supplementIds: ["sup-1", "sup-2"] }),
    );

    expect(mockSupplementFindMany).not.toHaveBeenCalled();
    expect(membershipData().totalAmount).toBe(2000);
  });

  it("rejects a registration whose PDF is not an uploaded file", async () => {
    const response = await POST(
      createRequest({
        ...memberOnlyBody,
        externalLicenseFileUrl: "https://evil.example.com/licencia.pdf",
      }),
    );

    expect(response.status).toBe(400);
    expect(mockMembershipCreate).not.toHaveBeenCalled();
  });

  it("rejects a registration with no license proof at all", async () => {
    const response = await POST(
      createRequest({
        ...memberOnlyBody,
        externalLicenseLabel: "",
        externalLicenseFileUrl: "",
      }),
    );

    expect(response.status).toBe(400);
    expect(mockMembershipCreate).not.toHaveBeenCalled();
  });
});
