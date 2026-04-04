import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appSetting: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

import { getMembershipFee, getNotificationEmails } from "../settings";

describe("getMembershipFee", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns default when no setting exists", async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await getMembershipFee()).toBe(2000);
  });

  it("returns stored value when valid", async () => {
    mockFindUnique.mockResolvedValue({ key: "MEMBERSHIP_FEE", value: "3500" });
    expect(await getMembershipFee()).toBe(3500);
  });

  it("returns default for non-numeric value", async () => {
    mockFindUnique.mockResolvedValue({ key: "MEMBERSHIP_FEE", value: "abc" });
    expect(await getMembershipFee()).toBe(2000);
  });
});

describe("getNotificationEmails", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns emails when setting contains a valid JSON array", async () => {
    mockFindUnique.mockResolvedValue({
      value: JSON.stringify(["a@b.com", "c@d.com"]),
    });
    expect(await getNotificationEmails("membership")).toEqual([
      "a@b.com",
      "c@d.com",
    ]);
  });

  it("returns [] when setting does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await getNotificationEmails("course")).toEqual([]);
  });

  it("returns [] for malformed JSON", async () => {
    mockFindUnique.mockResolvedValue({ value: "not-json" });
    expect(await getNotificationEmails("membership")).toEqual([]);
  });

  it("returns [] when value is a JSON object instead of array", async () => {
    mockFindUnique.mockResolvedValue({ value: '{"email":"a@b.com"}' });
    expect(await getNotificationEmails("membership")).toEqual([]);
  });

  it("filters out non-string values from the array", async () => {
    mockFindUnique.mockResolvedValue({
      value: JSON.stringify(["a@b.com", 123, null, "c@d.com"]),
    });
    expect(await getNotificationEmails("membership")).toEqual([
      "a@b.com",
      "c@d.com",
    ]);
  });

  it("uses correct key for membership type", async () => {
    mockFindUnique.mockResolvedValue(null);
    await getNotificationEmails("membership");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { key: "MEMBERSHIP_NOTIFICATION_EMAILS" },
    });
  });

  it("uses correct key for course type", async () => {
    mockFindUnique.mockResolvedValue(null);
    await getNotificationEmails("course");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { key: "COURSE_NOTIFICATION_EMAILS" },
    });
  });
});
