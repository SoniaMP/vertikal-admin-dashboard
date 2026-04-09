import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();
const mockDelete = vi.fn();
const mockCourseFindUnique = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: (...a: unknown[]) => mockAuth(...a) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseRegistration: {
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      delete: (...a: unknown[]) => mockDelete(...a),
    },
    courseCatalog: {
      findUnique: (...a: unknown[]) => mockCourseFindUnique(...a),
    },
  },
}));

const ADMIN_SESSION = { user: { id: "admin-1", role: "ADMIN" } };
const INSTRUCTOR_SESSION = { user: { id: "inst-1", role: "INSTRUCTOR" } };
const OTHER_INSTRUCTOR = { user: { id: "inst-2", role: "INSTRUCTOR" } };

describe("deleteEnrollee", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes registration when called by admin", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);
    mockFindUnique.mockResolvedValue({ courseCatalogId: "course-1" });

    const { deleteEnrollee } = await import("../course-registration-actions");
    const result = await deleteEnrollee("reg-1", "course-1");

    expect(result).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "reg-1" } });
  });

  it("deletes registration when called by course instructor", async () => {
    mockAuth.mockResolvedValue(INSTRUCTOR_SESSION);
    mockCourseFindUnique.mockResolvedValue({ instructorId: "inst-1" });
    mockFindUnique.mockResolvedValue({ courseCatalogId: "course-1" });

    const { deleteEnrollee } = await import("../course-registration-actions");
    const result = await deleteEnrollee("reg-1", "course-1");

    expect(result).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "reg-1" } });
  });

  it("rejects when instructor does not own the course", async () => {
    mockAuth.mockResolvedValue(OTHER_INSTRUCTOR);
    mockCourseFindUnique.mockResolvedValue({ instructorId: "inst-1" });

    const { deleteEnrollee } = await import("../course-registration-actions");
    const result = await deleteEnrollee("reg-1", "course-1");

    expect(result).toEqual({ success: false, error: "No autorizado" });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("rejects when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const { deleteEnrollee } = await import("../course-registration-actions");
    const result = await deleteEnrollee("reg-1", "course-1");

    expect(result).toEqual({ success: false, error: "No autorizado" });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns error when registration not found", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);
    mockFindUnique.mockResolvedValue(null);

    const { deleteEnrollee } = await import("../course-registration-actions");
    const result = await deleteEnrollee("missing", "course-1");

    expect(result).toEqual({
      success: false,
      error: "Inscripción no encontrada",
    });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("rejects when registration belongs to a different course", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);
    mockFindUnique.mockResolvedValue({ courseCatalogId: "course-other" });

    const { deleteEnrollee } = await import("../course-registration-actions");
    const result = await deleteEnrollee("reg-1", "course-1");

    expect(result).toEqual({ success: false, error: "No autorizado" });
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
