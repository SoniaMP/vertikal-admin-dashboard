import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();
const mockDelete = vi.fn();
const mockCreate = vi.fn();
const mockCourseFindUnique = vi.fn();
const mockPriceFindUnique = vi.fn();
const mockGetAvailableSpots = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: (...a: unknown[]) => mockAuth(...a) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseRegistration: {
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      delete: (...a: unknown[]) => mockDelete(...a),
      create: (...a: unknown[]) => mockCreate(...a),
    },
    courseCatalog: {
      findUnique: (...a: unknown[]) => mockCourseFindUnique(...a),
    },
    coursePrice: {
      findUnique: (...a: unknown[]) => mockPriceFindUnique(...a),
    },
  },
}));
vi.mock("@/lib/course-queries", () => ({
  getCourseAvailableSpots: (...a: unknown[]) => mockGetAvailableSpots(...a),
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

// ── addEnrollee ──

function buildFormData(overrides: Record<string, string> = {}): FormData {
  const defaults: Record<string, string> = {
    firstName: "María",
    lastName: "García López",
    email: "maria@example.com",
    coursePriceId: "price-1",
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(k, v);
  }
  return fd;
}

const INITIAL = { success: false, error: undefined };

describe("addEnrollee", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a MANUAL registration when called by admin", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);
    mockGetAvailableSpots.mockResolvedValue(5);
    mockPriceFindUnique.mockResolvedValue({ courseCatalogId: "course-1" });
    mockCreate.mockResolvedValue({ id: "new-reg" });

    const { addEnrollee } = await import("../course-registration-actions");
    const result = await addEnrollee("course-1", INITIAL, buildFormData());

    expect(result).toEqual({ success: true });
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firstName: "María",
        lastName: "García López",
        email: "maria@example.com",
        courseCatalogId: "course-1",
        coursePriceId: "price-1",
        paymentStatus: "MANUAL",
      }),
    });
  });

  it("creates registration when called by course instructor", async () => {
    mockAuth.mockResolvedValue(INSTRUCTOR_SESSION);
    mockCourseFindUnique.mockResolvedValue({ instructorId: "inst-1" });
    mockGetAvailableSpots.mockResolvedValue(3);
    mockPriceFindUnique.mockResolvedValue({ courseCatalogId: "course-1" });
    mockCreate.mockResolvedValue({ id: "new-reg" });

    const { addEnrollee } = await import("../course-registration-actions");
    const result = await addEnrollee("course-1", INITIAL, buildFormData());

    expect(result).toEqual({ success: true });
  });

  it("rejects when instructor does not own the course", async () => {
    mockAuth.mockResolvedValue(OTHER_INSTRUCTOR);
    mockCourseFindUnique.mockResolvedValue({ instructorId: "inst-1" });

    const { addEnrollee } = await import("../course-registration-actions");
    const result = await addEnrollee("course-1", INITIAL, buildFormData());

    expect(result).toEqual({ success: false, error: "No autorizado" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects when course is full", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);
    mockGetAvailableSpots.mockResolvedValue(0);

    const { addEnrollee } = await import("../course-registration-actions");
    const result = await addEnrollee("course-1", INITIAL, buildFormData());

    expect(result).toEqual({ success: false, error: "El curso está completo" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects when price does not belong to course", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);
    mockGetAvailableSpots.mockResolvedValue(5);
    mockPriceFindUnique.mockResolvedValue({ courseCatalogId: "other-course" });

    const { addEnrollee } = await import("../course-registration-actions");
    const result = await addEnrollee("course-1", INITIAL, buildFormData());

    expect(result).toEqual({
      success: false,
      error: "Precio no válido para este curso",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects with validation error for missing required fields", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION);

    const { addEnrollee } = await import("../course-registration-actions");
    const fd = new FormData();
    fd.set("firstName", "A");
    fd.set("lastName", "");
    fd.set("email", "bad");
    fd.set("coursePriceId", "");

    const result = await addEnrollee("course-1", INITIAL, fd);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
