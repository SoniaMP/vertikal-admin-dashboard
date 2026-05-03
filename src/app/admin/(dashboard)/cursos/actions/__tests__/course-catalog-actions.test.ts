import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: (...a: unknown[]) => mockAuth(...a) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseCatalog: {
      update: (...a: unknown[]) => mockUpdate(...a),
    },
  },
}));

const ADMIN_SESSION = { user: { id: "admin-1", role: "ADMIN" } };
const INSTRUCTOR_SESSION = { user: { id: "inst-1", role: "INSTRUCTOR" } };

describe("togglePublished", () => {
  beforeEach(() => vi.clearAllMocks());

  it("publishes the course (status=ACTIVE) when admin flips on", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);
    const { togglePublished } = await import("../course-catalog-actions");

    const result = await togglePublished("course-1", true);

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "course-1" },
      data: { status: "ACTIVE" },
    });
  });

  it("unpublishes the course (status=DRAFT) when admin flips off", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);
    const { togglePublished } = await import("../course-catalog-actions");

    const result = await togglePublished("course-1", false);

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "course-1" },
      data: { status: "DRAFT" },
    });
  });

  it("rejects instructor with auth error", async () => {
    mockAuth.mockResolvedValue(INSTRUCTOR_SESSION);
    const { togglePublished } = await import("../course-catalog-actions");

    const result = await togglePublished("course-1", true);

    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated request", async () => {
    mockAuth.mockResolvedValue(null);
    const { togglePublished } = await import("../course-catalog-actions");

    const result = await togglePublished("course-1", true);

    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
