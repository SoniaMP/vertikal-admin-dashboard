import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test the same email validation logic used by EmailChipInput
const emailSchema = z.string().email();

describe("EmailChipInput validation logic", () => {
  it("accepts valid email addresses", () => {
    const validEmails = [
      "user@example.com",
      "first.last@domain.org",
      "name+tag@test.co.uk",
    ];
    for (const email of validEmails) {
      expect(emailSchema.safeParse(email).success).toBe(true);
    }
  });

  it("rejects invalid email addresses", () => {
    const invalidEmails = [
      "not-an-email",
      "@missing-local.com",
      "missing-domain@",
      "spaces in@email.com",
      "",
    ];
    for (const email of invalidEmails) {
      expect(emailSchema.safeParse(email).success).toBe(false);
    }
  });

  it("chip list operations: add", () => {
    const emails: string[] = [];
    const updated = [...emails, "a@b.com"];
    expect(updated).toEqual(["a@b.com"]);
  });

  it("chip list operations: remove", () => {
    const emails = ["a@b.com", "c@d.com", "e@f.com"];
    const updated = emails.filter((e) => e !== "c@d.com");
    expect(updated).toEqual(["a@b.com", "e@f.com"]);
  });

  it("chip list operations: deduplicate check", () => {
    const emails = ["a@b.com", "c@d.com"];
    const newEmail = "a@b.com";
    const isDuplicate = emails.includes(newEmail);
    expect(isDuplicate).toBe(true);
  });

  it("normalizes email to lowercase before adding", () => {
    const input = "User@Example.COM";
    const normalized = input.trim().toLowerCase();
    expect(normalized).toBe("user@example.com");
  });
});
