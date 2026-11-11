import { describe, it, expect } from "vitest";
import { personalDataSchema } from "../registration";

const validPersonalData = {
  firstName: "Juan",
  lastName: "Garcia Lopez",
  email: "juan@example.com",
  phone: "612345678",
  dni: "12345678A",
  dateOfBirth: "1990-01-15",
  sex: "M",
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

  it("accepts F as sex", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      sex: "F",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty sex", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      sex: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sex value", () => {
    const result = personalDataSchema.safeParse({
      ...validPersonalData,
      sex: "X",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const sexError = result.error.issues.find((i) => i.path.includes("sex"));
      expect(sexError?.message).toBe("Selecciona el sexo");
    }
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
