import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.AUTH_SECRET = "test-secret-for-renewal-codes";

const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    renewalCode: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

const { verifyRenewalCode } = await import("../renewal-code-verify");
const { hashRenewalCode } = await import("../renewal-code-hash");

const DNI = "12345678Z";
const CODE = "483912";

function storedCode(overrides: Record<string, unknown> = {}) {
  return {
    id: "code-1",
    dni: DNI,
    codeHash: hashRenewalCode(CODE),
    expiresAt: new Date(Date.now() + 60_000),
    attempts: 0,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("verifyRenewalCode", () => {
  it("accepts the right code and consumes it", async () => {
    mockFindFirst.mockResolvedValue(storedCode());
    await expect(verifyRenewalCode(DNI, CODE)).resolves.toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "code-1" } });
  });

  it("rejects when no code was ever issued", async () => {
    mockFindFirst.mockResolvedValue(null);
    await expect(verifyRenewalCode(DNI, CODE)).resolves.toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects an expired code and clears it", async () => {
    mockFindFirst.mockResolvedValue(
      storedCode({ expiresAt: new Date(Date.now() - 1) }),
    );
    await expect(verifyRenewalCode(DNI, CODE)).resolves.toBe(false);
    expect(mockDelete).toHaveBeenCalled();
  });

  it("spends an attempt on a wrong code without clearing it", async () => {
    mockFindFirst.mockResolvedValue(storedCode());
    await expect(verifyRenewalCode(DNI, "000000")).resolves.toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "code-1" },
      data: { attempts: { increment: 1 } },
    });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("burns the code once the attempts run out, even if the code is right", async () => {
    mockFindFirst.mockResolvedValue(storedCode({ attempts: 5 }));
    await expect(verifyRenewalCode(DNI, CODE)).resolves.toBe(false);
    expect(mockDelete).toHaveBeenCalled();
  });

  it("cannot be replayed: the second use finds nothing", async () => {
    mockFindFirst.mockResolvedValueOnce(storedCode()).mockResolvedValue(null);
    await expect(verifyRenewalCode(DNI, CODE)).resolves.toBe(true);
    await expect(verifyRenewalCode(DNI, CODE)).resolves.toBe(false);
  });
});
