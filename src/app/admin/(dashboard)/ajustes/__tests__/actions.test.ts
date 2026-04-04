import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpsert = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appSetting: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "admin" } }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { updateNotificationEmails } from "../actions";

const prev = { success: true };

function buildFormData(type: string, emails: unknown): FormData {
  const fd = new FormData();
  fd.set("type", type);
  fd.set("emails", JSON.stringify(emails));
  return fd;
}

describe("updateNotificationEmails", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upserts valid emails for membership type", async () => {
    const fd = buildFormData("membership", ["a@b.com", "c@d.com"]);
    const result = await updateNotificationEmails(prev, fd);

    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { key: "MEMBERSHIP_NOTIFICATION_EMAILS" },
      update: { value: JSON.stringify(["a@b.com", "c@d.com"]) },
      create: {
        key: "MEMBERSHIP_NOTIFICATION_EMAILS",
        value: JSON.stringify(["a@b.com", "c@d.com"]),
      },
    });
  });

  it("upserts valid emails for course type", async () => {
    const fd = buildFormData("course", ["x@y.com"]);
    const result = await updateNotificationEmails(prev, fd);

    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: "COURSE_NOTIFICATION_EMAILS" },
      }),
    );
  });

  it("deduplicates emails", async () => {
    const fd = buildFormData("membership", ["a@b.com", "a@b.com", "c@d.com"]);
    const result = await updateNotificationEmails(prev, fd);

    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { value: JSON.stringify(["a@b.com", "c@d.com"]) },
      }),
    );
  });

  it("returns error for invalid email", async () => {
    const fd = buildFormData("membership", ["not-an-email"]);
    const result = await updateNotificationEmails(prev, fd);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("returns error for invalid type", async () => {
    const fd = buildFormData("invalid", ["a@b.com"]);
    const result = await updateNotificationEmails(prev, fd);

    expect(result).toEqual({
      success: false,
      error: "Tipo de notificación inválido",
    });
  });

  it("returns error for malformed JSON", async () => {
    const fd = new FormData();
    fd.set("type", "membership");
    fd.set("emails", "not-json");
    const result = await updateNotificationEmails(prev, fd);

    expect(result).toEqual({
      success: false,
      error: "Formato de emails inválido",
    });
  });

  it("accepts empty list", async () => {
    const fd = buildFormData("membership", []);
    const result = await updateNotificationEmails(prev, fd);

    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { value: "[]" },
      }),
    );
  });
});
