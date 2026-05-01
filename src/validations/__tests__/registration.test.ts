import { describe, it, expect } from "vitest";
import {
  personalDataSchema,
  licenseSelectionSchema,
  registrationSchema,
} from "../registration";

const validPersonalData = {
  firstName: "Juan",
  lastName: "Garcia Lopez",
  email: "juan@example.com",
  phone: "612345678",
  dni: "12345678A",
  dateOfBirth: "1990-01-15",
  address: "Calle Mayor 10",
  city: "Madrid",
  postalCode: "28001",
  province: "Madrid",
};

describe("personalDataSchema", () => {
  it("accepts valid personal data", () => {
    const result = personalDataSchema.safeParse(validPersonalData);
    expect(result.success).toBe(true);
  });

  it("accepts phone with +34 prefix", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      phone: "+34612345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short first name", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      firstName: "J",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone number", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      phone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone starting with non-6-9 digit", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      phone: "512345678",
    });
    expect(result.success).toBe(false);
  });

  it("normalizes Spanish DNI with dots and dashes", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      dni: "12.345.678-a",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.dni).toBe("12345678A");
  });

  it("accepts NIE format", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      dni: "X1234567L",
    });
    expect(result.success).toBe(true);
  });

  it("accepts numeric-only foreign passport", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      dni: "123456789",
    });
    expect(result.success).toBe(true);
  });

  it("rejects DNI shorter than 5 characters", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      dni: "1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects DNI longer than 20 characters", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      dni: "123456789012345678901",
    });
    expect(result.success).toBe(false);
  });

  it("rejects DNI with invalid characters", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      dni: "ABC@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid postal code", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      postalCode: "1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty date of birth", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      dateOfBirth: "",
    });
    expect(result.success).toBe(false);
  });

  it("returns Spanish error messages", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      firstName: "J",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) =>
        i.path.includes("firstName"),
      );
      expect(nameError?.message).toBe(
        "El nombre debe tener al menos 2 caracteres",
      );
    }
  });
});

describe("licenseSelectionSchema", () => {
  it("accepts valid selection with supplements", () => {
    const result = licenseSelectionSchema.safeParse({
      typeId: "abc123",
      subtypeId: "sub123",
      categoryId: "cat123",
      supplementIds: ["sup1", "sup2"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts selection without supplements", () => {
    const result = licenseSelectionSchema.safeParse({
      typeId: "abc123",
      subtypeId: "sub123",
      categoryId: "cat123",
      supplementIds: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty type id", () => {
    const result = licenseSelectionSchema.safeParse({
      typeId: "",
      subtypeId: "sub123",
      categoryId: "cat123",
      supplementIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty subtype id", () => {
    const result = licenseSelectionSchema.safeParse({
      typeId: "abc123",
      subtypeId: "",
      categoryId: "cat123",
      supplementIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing subtype id", () => {
    const result = licenseSelectionSchema.safeParse({
      typeId: "abc123",
      categoryId: "cat123",
      supplementIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty category id", () => {
    const result = licenseSelectionSchema.safeParse({
      typeId: "abc123",
      subtypeId: "sub123",
      categoryId: "",
      supplementIds: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("registrationSchema", () => {
  it("accepts complete valid registration", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      typeId: "fed1",
      subtypeId: "sub1",
      categoryId: "cat1",
      supplementIds: ["sup1"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects registration missing type", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      subtypeId: "sub1",
      categoryId: "cat1",
      supplementIds: ["sup1"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects registration missing subtype", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      typeId: "fed1",
      categoryId: "cat1",
      supplementIds: ["sup1"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects registration with invalid personal data", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      email: "bad",
      typeId: "fed1",
      subtypeId: "sub1",
      categoryId: "cat1",
      supplementIds: [],
    });
    expect(result.success).toBe(false);
  });
});
