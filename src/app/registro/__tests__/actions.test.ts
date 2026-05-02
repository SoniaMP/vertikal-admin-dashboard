import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMemberFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: {
      findUnique: (...a: unknown[]) => mockMemberFindUnique(...a),
    },
  },
}));

vi.mock("@/lib/settings", () => ({
  getActiveSeason: vi.fn().mockResolvedValue({ id: "season-1" }),
}));

describe("checkDni", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns dni_invalido when input fails schema validation", async () => {
    const { checkDni } = await import("../actions");
    const result = await checkDni("123");
    expect(result.reason).toBe("dni_invalido");
    expect(mockMemberFindUnique).not.toHaveBeenCalled();
  });

  it("returns dni_no_existe when DNI is not in DB", async () => {
    mockMemberFindUnique.mockResolvedValue(null);
    const { checkDni } = await import("../actions");
    const result = await checkDni("12345678A");
    expect(result.reason).toBe("dni_no_existe");
  });

  it("returns dni_existe_sin_membresia_temporada when member has no current-season membership", async () => {
    mockMemberFindUnique.mockResolvedValue({ id: "m1", memberships: [] });
    const { checkDni } = await import("../actions");
    const result = await checkDni("12345678A");
    expect(result.reason).toBe("dni_existe_sin_membresia_temporada");
  });

  it("returns dni_existe_con_membresia_temporada when member already has a membership for the active season", async () => {
    mockMemberFindUnique.mockResolvedValue({
      id: "m1",
      memberships: [{ id: "ms1" }],
    });
    const { checkDni } = await import("../actions");
    const result = await checkDni("12345678A");
    expect(result.reason).toBe("dni_existe_con_membresia_temporada");
  });

  it("normalizes the DNI before querying", async () => {
    mockMemberFindUnique.mockResolvedValue(null);
    const { checkDni } = await import("../actions");
    await checkDni("12.345.678-a");
    expect(mockMemberFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { dni: "12345678A" } }),
    );
  });

  it("scopes the membership lookup to the active season", async () => {
    mockMemberFindUnique.mockResolvedValue({ id: "m1", memberships: [] });
    const { checkDni } = await import("../actions");
    await checkDni("12345678A");
    expect(mockMemberFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          memberships: expect.objectContaining({
            where: { seasonId: "season-1" },
          }),
        }),
      }),
    );
  });
});
