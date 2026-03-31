import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpsert = vi.fn();
const mockCreate = vi.fn();
const mockTransaction = vi.fn();
const mockOfferingFindFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    licenseOffering: {
      findFirst: (...a: unknown[]) => mockOfferingFindFirst(...a),
    },
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/settings", () => ({
  getActiveSeason: vi.fn().mockResolvedValue({ id: "season-1", name: "2025-2026" }),
}));

function buildTx() {
  return {
    membership: { create: mockCreate },
    member: { upsert: mockUpsert },
  };
}

function buildFormData(overrides: Record<string, string | null> = {}): FormData {
  const defaults: Record<string, string> = {
    firstName: "Ana",
    lastName: "Garcia Lopez",
    email: "ana@example.com",
    phone: "612345678",
    dni: "12345678A",
    dateOfBirth: "1990-01-15",
    address: "Calle Mayor 10",
    city: "Madrid",
    postalCode: "28001",
    province: "Madrid",
    typeId: "ft-1",
    subtypeId: "fs-1",
    categoryId: "cat-1",
  };
  const merged = { ...defaults, ...overrides };
  const fd = new FormData();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== null) fd.set(k, v);
  }
  return fd;
}

describe("createMemberWithMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOfferingFindFirst.mockResolvedValue({ id: "offering-1" });
    mockUpsert.mockResolvedValue({ id: "m-1" });
    mockTransaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) => fn(buildTx()),
    );
  });

  it("returns validation error for empty license type", async () => {
    const { createMemberWithMembership } = await import("../create-member-actions");

    const result = await createMemberWithMembership(
      { success: false },
      buildFormData({ typeId: "" }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Selecciona un tipo de licencia");
  });

  it("returns validation error when license type is missing (null)", async () => {
    const { createMemberWithMembership } = await import("../create-member-actions");

    const result = await createMemberWithMembership(
      { success: false },
      buildFormData({ typeId: null }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Selecciona un tipo de licencia");
  });

  it("returns validation error for empty subtype", async () => {
    const { createMemberWithMembership } = await import("../create-member-actions");

    const result = await createMemberWithMembership(
      { success: false },
      buildFormData({ subtypeId: "" }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Selecciona un subtipo");
  });

  it("catches database errors gracefully", async () => {
    const { createMemberWithMembership } = await import("../create-member-actions");
    mockTransaction.mockRejectedValue(new Error("DB constraint error"));

    const result = await createMemberWithMembership(
      { success: false },
      buildFormData(),
    );

    expect(result).toEqual({ success: false, error: "Error al crear la membresía" });
  });

  it("creates membership with valid data", async () => {
    const { createMemberWithMembership } = await import("../create-member-actions");

    const result = await createMemberWithMembership(
      { success: false },
      buildFormData(),
    );

    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalled();
  });
});
