import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

const mockOfferingFind = vi.fn();
const mockSupplementFindMany = vi.fn();
const mockSupplementPriceFindMany = vi.fn();
const mockGroupPriceFindMany = vi.fn();
const mockLinkFindMany = vi.fn();
const mockGroupLinkFindMany = vi.fn();
const mockMemberUpsert = vi.fn();
const mockMembershipCreate = vi.fn();
const mockMembershipUpdate = vi.fn();
const mockMembershipFindUnique = vi.fn();
const mockMembershipSupplementDeleteMany = vi.fn();
const mockSessionCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    licenseOffering: {
      findFirst: (...args: unknown[]) => mockOfferingFind(...args),
    },
    supplement: {
      findMany: (...args: unknown[]) => mockSupplementFindMany(...args),
    },
    supplementPrice: {
      findMany: (...args: unknown[]) => mockSupplementPriceFindMany(...args),
    },
    supplementGroupPrice: {
      findMany: (...args: unknown[]) => mockGroupPriceFindMany(...args),
    },
    licenseTypeSupplement: {
      findMany: (...args: unknown[]) => mockLinkFindMany(...args),
    },
    licenseTypeSupplementGroup: {
      findMany: (...args: unknown[]) => mockGroupLinkFindMany(...args),
    },
    member: {
      upsert: (...args: unknown[]) => mockMemberUpsert(...args),
    },
    membership: {
      create: (...args: unknown[]) => mockMembershipCreate(...args),
      update: (...args: unknown[]) => mockMembershipUpdate(...args),
      findUnique: (...args: unknown[]) => mockMembershipFindUnique(...args),
    },
    membershipSupplement: {
      deleteMany: (...args: unknown[]) =>
        mockMembershipSupplementDeleteMany(...args),
    },
  },
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mockSessionCreate(...args),
      },
    },
  }),
}));

vi.mock("@/lib/settings", () => ({
  getMembershipFee: () => Promise.resolve(2000),
  getActiveSeason: () =>
    Promise.resolve({ id: "season-1", name: "2025-2026" }),
}));

function createRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const validBody = {
  firstName: "Juan",
  lastName: "Garcia",
  email: "juan@test.com",
  phone: "612345678",
  dni: "12345678A",
  dateOfBirth: "1990-01-15",
  sex: "M",
  address: "Calle Mayor 1",
  city: "Madrid",
  postalCode: "28001",
  province: "Madrid",
  hasClubLicense: true,
  typeId: "type-1",
  subtypeId: "sub-1",
  categoryId: "cat-1",
  supplementIds: ["sup-1"],
  externalLicenseLabel: "",
  externalLicenseFileUrl: "",
};

const mockOffering = {
  id: "off-1",
  seasonId: "season-1",
  typeId: "type-1",
  subtypeId: "sub-1",
  categoryId: "cat-1",
  price: 4500,
  type: { id: "type-1", name: "Nacional" },
  subtype: { id: "sub-1", name: "Basica" },
  category: { id: "cat-1", name: "Adulto" },
};

function setupHappyPath() {
  mockOfferingFind.mockResolvedValue(mockOffering);
  mockSupplementFindMany.mockResolvedValue([
    {
      id: "sup-1",
      name: "Seguro extra",
      price: null,
      active: true,
      supplementGroupId: null,
      supplementGroup: null,
    },
  ]);
  mockSupplementPriceFindMany.mockResolvedValue([
    { supplementId: "sup-1", price: 1000 },
  ]);
  mockGroupPriceFindMany.mockResolvedValue([]);
  mockLinkFindMany.mockResolvedValue([
    { typeId: "type-1", supplementId: "sup-1" },
  ]);
  mockGroupLinkFindMany.mockResolvedValue([]);
  mockMemberUpsert.mockResolvedValue({ id: "member-1" });
  mockMembershipFindUnique.mockResolvedValue(null);
  mockMembershipCreate.mockResolvedValue({ id: "ms-123" });
  mockMembershipUpdate.mockResolvedValue({});
  mockSessionCreate.mockResolvedValue({
    id: "cs_test_123",
    url: "https://checkout.stripe.com/pay/cs_test_123",
  });
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("returns 400 for invalid data", async () => {
    const request = createRequest({ firstName: "" });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Datos de registro inválidos");
  });

  it("returns 400 when offering not found", async () => {
    mockOfferingFind.mockResolvedValue(null);

    const request = createRequest(validBody);
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    // The member reads this verbatim in the wizard, so it has to name the step
    // they can fix it from instead of describing a missing database row.
    expect(data.error).toContain("Vuelve al paso de licencia");
  });

  it("returns 400 for invalid supplements", async () => {
    mockOfferingFind.mockResolvedValue(mockOffering);
    mockSupplementFindMany.mockResolvedValue([]);

    const request = createRequest(validBody);
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Suplementos inválidos");
  });

  it("returns 400 when the supplement is not offered in the chosen federation", async () => {
    setupHappyPath();
    mockLinkFindMany.mockResolvedValue([]);

    const request = createRequest(validBody);
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Suplementos inválidos");
    expect(mockSessionCreate).not.toHaveBeenCalled();
  });

  it("upserts member, creates membership, and returns Stripe session URL", async () => {
    setupHappyPath();

    const request = createRequest(validBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.url).toBe("https://checkout.stripe.com/pay/cs_test_123");

    expect(mockMemberUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { dni: "12345678A" },
        create: expect.objectContaining({
          dni: "12345678A",
          email: "juan@test.com",
        }),
        update: expect.objectContaining({ email: "juan@test.com" }),
      }),
    );

    // Total: offering 4500 + membership 2000 + supplement 1000 = 7500
    expect(mockMembershipCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          memberId: "member-1",
          seasonId: "season-1",
          totalAmount: 7500,
          paymentStatus: "PENDING",
          typeId: "type-1",
          subtypeId: "sub-1",
          categoryId: "cat-1",
          offeringId: "off-1",
          licensePriceSnapshot: 4500,
          licenseLabelSnapshot: "Nacional - Basica - Adulto",
        }),
      }),
    );

    expect(mockMembershipUpdate).toHaveBeenCalledWith({
      where: { id: "ms-123" },
      data: { stripeSessionId: "cs_test_123" },
    });

    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { membershipId: "ms-123" },
      }),
    );
  });

  it("returns 409 when member already has an active membership", async () => {
    setupHappyPath();
    mockMembershipFindUnique.mockResolvedValue({
      id: "ms-existing",
      status: "ACTIVE",
    });

    const request = createRequest(validBody);
    const response = await POST(request);

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toBe(
      "Ya tienes una inscripción activa para esta temporada",
    );
    expect(mockMembershipCreate).not.toHaveBeenCalled();
  });

  it("reuses existing non-active membership instead of creating new one", async () => {
    setupHappyPath();
    mockMembershipFindUnique.mockResolvedValue({
      id: "ms-old",
      status: "CANCELLED",
    });
    mockMembershipUpdate.mockResolvedValue({ id: "ms-old" });

    const request = createRequest(validBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockMembershipCreate).not.toHaveBeenCalled();
    expect(mockMembershipSupplementDeleteMany).toHaveBeenCalledWith({
      where: { membershipId: "ms-old" },
    });
  });

  it("returns 502 and marks membership FAILED/CANCELLED when Stripe throws", async () => {
    setupHappyPath();
    mockSessionCreate.mockRejectedValue(
      new Error("Invalid API Key provided: sk_test_REPLACE_ME"),
    );

    const request = createRequest(validBody);
    const response = await POST(request);

    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain("Error al conectar con la pasarela de pago");
    expect(data.error).toContain("Invalid API Key");

    expect(mockMembershipUpdate).toHaveBeenCalledWith({
      where: { id: "ms-123" },
      data: { paymentStatus: "FAILED", status: "CANCELLED" },
    });
  });

  it("normalizes DNI to uppercase in member upsert", async () => {
    setupHappyPath();

    const request = createRequest({ ...validBody, dni: "12345678a" });
    await POST(request);

    expect(mockMemberUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { dni: "12345678A" },
      }),
    );
  });

  it("creates membership without supplements", async () => {
    setupHappyPath();
    mockSupplementFindMany.mockResolvedValue([]);

    const request = createRequest({ ...validBody, supplementIds: [] });
    const response = await POST(request);

    expect(response.status).toBe(200);

    // Total: offering 4500 + membership 2000 = 6500
    expect(mockMembershipCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalAmount: 6500 }),
      }),
    );
  });
});
