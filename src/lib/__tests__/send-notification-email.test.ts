import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn().mockResolvedValue({ id: "email_123" });
const mockGetNotificationEmails = vi.fn();
const mockFindUniqueOrThrow = vi.fn();
const mockCourseFindUniqueOrThrow = vi.fn();

vi.mock("@/lib/resend", () => ({
  getResend: () => Promise.resolve({ emails: { send: mockSend } }),
}));

vi.mock("@/lib/email-renderer", () => ({
  renderBrandedEmail: () => Promise.resolve("<html>test</html>"),
}));

vi.mock("@/lib/settings", () => ({
  getNotificationEmails: (...args: unknown[]) =>
    mockGetNotificationEmails(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    membership: {
      findUniqueOrThrow: (...args: unknown[]) =>
        mockFindUniqueOrThrow(...args),
    },
    courseRegistration: {
      findUniqueOrThrow: (...args: unknown[]) =>
        mockCourseFindUniqueOrThrow(...args),
    },
  },
}));

const MEMBERSHIP_DATA = {
  id: "ms-1",
  totalAmount: 8500,
  licenseLabelSnapshot: "Federativa — Adulto",
  member: {
    firstName: "Maria",
    lastName: "Garcia",
    dni: "12345678A",
    email: "maria@example.com",
    phone: "612345678",
    address: "Calle Mayor 10",
    city: "Madrid",
    postalCode: "28001",
    province: "Madrid",
  },
  season: { name: "2025-2026" },
  supplements: [{ supplement: { name: "Seguro RC" } }],
};

const COURSE_DATA = {
  id: "creg-1",
  firstName: "Carlos",
  lastName: "Lopez",
  dni: "87654321B",
  email: "carlos@example.com",
  phone: "698765432",
  courseCatalog: { title: "Escalada deportiva" },
  coursePrice: { name: "Socio", amountCents: 4500 },
};

describe("sendClubMembershipNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EMAIL_FROM = "club@test.com";
    mockFindUniqueOrThrow.mockResolvedValue(MEMBERSHIP_DATA);
  });

  it("sends email to all configured recipients", async () => {
    mockGetNotificationEmails.mockResolvedValue([
      "admin1@test.com",
      "admin2@test.com",
    ]);

    const { sendClubMembershipNotification } = await import(
      "../send-notification-email"
    );
    await sendClubMembershipNotification("ms-1");

    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["admin1@test.com", "admin2@test.com"],
        from: "club@test.com",
        subject: "Nueva inscripcion de socio — Maria Garcia",
      }),
    );
  });

  it("skips silently when no recipients are configured", async () => {
    mockGetNotificationEmails.mockResolvedValue([]);

    const { sendClubMembershipNotification } = await import(
      "../send-notification-email"
    );
    await sendClubMembershipNotification("ms-1");

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockFindUniqueOrThrow).not.toHaveBeenCalled();
  });
});

describe("sendClubCourseNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EMAIL_FROM = "club@test.com";
    mockCourseFindUniqueOrThrow.mockResolvedValue(COURSE_DATA);
  });

  it("sends email to all configured recipients", async () => {
    mockGetNotificationEmails.mockResolvedValue(["admin@test.com"]);

    const { sendClubCourseNotification } = await import(
      "../send-notification-email"
    );
    await sendClubCourseNotification("creg-1");

    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["admin@test.com"],
        from: "club@test.com",
        subject: "Nueva inscripcion en curso — Escalada deportiva",
      }),
    );
  });

  it("skips silently when no recipients are configured", async () => {
    mockGetNotificationEmails.mockResolvedValue([]);

    const { sendClubCourseNotification } = await import(
      "../send-notification-email"
    );
    await sendClubCourseNotification("creg-1");

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockCourseFindUniqueOrThrow).not.toHaveBeenCalled();
  });
});
