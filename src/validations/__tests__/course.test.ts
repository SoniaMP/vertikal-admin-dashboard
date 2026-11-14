import { describe, it, expect } from "vitest";
import {
  courseCatalogSchema,
  courseRegistrationCheckoutSchema,
  manualEnrolleeSchema,
} from "@/validations/course";

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

  it("accepts deadline and courseDate on the same calendar day with different hours", () => {
    // Server-side normalization yields courseDate=00:00 and deadline=23:59
    // for the same day; the refine must compare day-only, not timestamp.
    const result = courseCatalogSchema.safeParse({
      ...baseInput,
      courseDate: new Date(2026, 5, 15, 0, 0, 0),
      registrationDeadline: new Date(2026, 5, 15, 23, 59, 59),
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

describe("courseRegistrationCheckoutSchema", () => {
  const validInput = {
    firstName: "Ana",
    lastName: "García",
    email: "ana@example.com",
    phone: "612345678",
    dni: "12345678Z",
    dateOfBirth: "1990-01-01",
    address: "Calle Mayor 1",
    city: "Madrid",
    postalCode: "28001",
    province: "Madrid",
    courseCatalogId: "course-1",
    coursePriceId: "price-1",
    licenseType: "FEDME",
    licenseFileUrl: "https://example.com/license.pdf",
  };

  it("accepts a registration without a sex field (course flow does not capture it)", () => {
    const result = courseRegistrationCheckoutSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("ignores a sex field if present", () => {
    const result = courseRegistrationCheckoutSchema.safeParse({
      ...validInput,
      sex: "whatever",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("sex" in result.data).toBe(false);
    }
  });
});

describe("manualEnrolleeSchema", () => {
  const validEnrollee = {
    firstName: "Ana",
    lastName: "García",
    email: "ana@example.com",
    coursePriceId: "price-1",
  };

  // The admin enrolls people who are not members, so most fields stay blank.
  it("accepts an enrollee with no date of birth", () => {
    const result = manualEnrolleeSchema.safeParse(validEnrollee);

    expect(result.success).toBe(true);
    expect(result.data?.dateOfBirth).toBe("");
  });

  it("rejects a date of birth that is filled in but not a date", () => {
    const result = manualEnrolleeSchema.safeParse({
      ...validEnrollee,
      dateOfBirth: "no soy una fecha",
    });

    expect(result.success).toBe(false);
  });

  it("accepts an email pasted with surrounding spaces", () => {
    const result = manualEnrolleeSchema.safeParse({
      ...validEnrollee,
      email: "  ana@example.com  ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("ana@example.com");
  });
});
