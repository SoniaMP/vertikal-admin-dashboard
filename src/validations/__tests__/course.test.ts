import { describe, it, expect } from "vitest";
import { courseCatalogSchema } from "@/validations/course";

describe("courseCatalogSchema", () => {
  const baseInput = {
    title: "Curso test",
    slug: "curso-test",
    courseTypeId: "type-1",
    maxCapacity: 10,
  };

  it("accepts a deadline equal to courseDate", () => {
    const date = new Date(2026, 5, 15);
    const result = courseCatalogSchema.safeParse({
      ...baseInput,
      courseDate: date,
      registrationDeadline: date,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a deadline before courseDate", () => {
    const result = courseCatalogSchema.safeParse({
      ...baseInput,
      courseDate: new Date(2026, 5, 15),
      registrationDeadline: new Date(2026, 5, 10),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a deadline after courseDate", () => {
    const result = courseCatalogSchema.safeParse({
      ...baseInput,
      courseDate: new Date(2026, 5, 15),
      registrationDeadline: new Date(2026, 5, 20),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues[0];
      expect(issue.path).toEqual(["registrationDeadline"]);
      expect(issue.message).toMatch(/anterior o igual/i);
    }
  });

  it("accepts null deadline (draft state)", () => {
    const result = courseCatalogSchema.safeParse({
      ...baseInput,
      courseDate: new Date(2026, 5, 15),
      registrationDeadline: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null courseDate (draft state)", () => {
    const result = courseCatalogSchema.safeParse({
      ...baseInput,
      courseDate: null,
      registrationDeadline: new Date(2026, 5, 10),
    });
    expect(result.success).toBe(true);
  });
});
