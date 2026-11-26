import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGroupFindUnique = vi.fn();
const mockGroupFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    season: {
      findUnique: () => Promise.resolve({ year: new Date().getFullYear() }),
    },
    supplementGroup: {
      findUnique: (...args: unknown[]) => mockGroupFindUnique(...args),
      findMany: (...args: unknown[]) => mockGroupFindMany(...args),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const NEXT_YEAR = new Date().getFullYear() + 1;

function group(name: string, active = true) {
  return { name, active, lineageId: "lin-espeleo", seasonId: "season-2026" };
}

/** The 2026 row is read first, then the 2029 sibling it is compared against. */
function readsSourceThenSibling(source: object, sibling: object) {
  mockGroupFindUnique
    .mockResolvedValueOnce(source)
    .mockResolvedValueOnce(source)
    .mockResolvedValueOnce(sibling);
}

async function findTargets(scope: string) {
  const { findPropagationTargets } = await import("../propagation-actions");
  return findPropagationTargets("supplementGroup", "grp-2026", scope);
}

describe("findPropagationTargets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGroupFindMany.mockResolvedValue([
      { id: "grp-2029", season: { year: NEXT_YEAR } },
    ]);
  });

  it("asks nothing when the other year already has the same name", async () => {
    readsSourceThenSibling(group("Espeleosocorristas"), group("Espeleosocorristas"));

    const targets = await findTargets("texts");

    expect(targets.years).toEqual([]);
  });

  it("asks when the other year has a different name", async () => {
    readsSourceThenSibling(group("Espeleo-socorro"), group("Espeleosocorristas"));

    const targets = await findTargets("texts");

    expect(targets.years).toEqual([NEXT_YEAR]);
    expect(targets.name).toBe("Espeleo-socorro");
  });

  it("asks nothing when the other year is already retired too", async () => {
    readsSourceThenSibling(
      group("Espeleosocorristas", false),
      group("Espeleosocorristas", false),
    );

    const targets = await findTargets("state");

    expect(targets.years).toEqual([]);
  });

  it("asks when the other year is still active", async () => {
    readsSourceThenSibling(
      group("Espeleosocorristas", false),
      group("Espeleosocorristas", true),
    );

    const targets = await findTargets("state");

    expect(targets.years).toEqual([NEXT_YEAR]);
  });

  it("asks nothing when no other open season has it", async () => {
    readsSourceThenSibling(group("Espeleosocorristas"), group("Otro"));
    mockGroupFindMany.mockResolvedValue([]);

    const targets = await findTargets("texts");

    expect(targets.years).toEqual([]);
  });

  it("asks nothing for a scope it does not know", async () => {
    readsSourceThenSibling(group("Espeleosocorristas"), group("Otro"));

    const targets = await findTargets("links");

    expect(targets.years).toEqual([]);
    expect(mockGroupFindUnique).not.toHaveBeenCalled();
  });
});
