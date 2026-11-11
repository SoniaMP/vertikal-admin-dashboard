import { describe, it, expect } from "vitest";
import { licenseSelectionSchema, registrationSchema } from "../registration";

const validPersonalData = {
  firstName: "Juan",
  lastName: "Garcia Lopez",
  email: "juan@example.com",
  phone: "612345678",
  dni: "12345678Z",
  dateOfBirth: "1990-05-12",
  sex: "M",
  address: "Calle Mayor 1",
  city: "Murcia",
  postalCode: "30001",
  province: "Murcia",
};

const emptyLicenseFields = {
  typeId: "",
  subtypeId: "",
  categoryId: "",
  supplementIds: [],
  externalLicenseLabel: "",
  externalLicenseFileUrl: "",
};

const clubBranch = {
  ...emptyLicenseFields,
  hasClubLicense: true,
  typeId: "type1",
  subtypeId: "sub1",
  categoryId: "cat1",
};

const memberOnlyBranch = {
  ...emptyLicenseFields,
  hasClubLicense: false,
  externalLicenseLabel: "FERM PLUS A",
  externalLicenseFileUrl:
    "/api/uploads/licenses/3f6a1b2c-0d4e-4f5a-9b8c-7d6e5f4a3b2c.pdf",
};

function errorFor(
  result: ReturnType<typeof registrationSchema.safeParse>,
  field: string,
) {
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field);
}

describe("licenseSelectionSchema", () => {
  it("requires an explicit choice of license branch", () => {
    const { hasClubLicense: _omitted, ...withoutChoice } = clubBranch;
    const result = licenseSelectionSchema.safeParse(withoutChoice);
    expect(result.success).toBe(false);
  });

  it("rejects a non-boolean branch discriminator", () => {
    const result = licenseSelectionSchema.safeParse({
      ...clubBranch,
      hasClubLicense: "yes",
    });
    expect(result.success).toBe(false);
  });
});

describe("registrationSchema — license through the club", () => {
  it("accepts a complete selection", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...clubBranch,
      supplementIds: ["sup1", "sup2"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a selection without supplements", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...clubBranch,
    });
    expect(result.success).toBe(true);
  });

  it.each([
    ["typeId", "Selecciona un tipo de licencia"],
    ["subtypeId", "Selecciona un subtipo de licencia"],
    ["categoryId", "Selecciona una categoría"],
  ])("rejects an empty %s", (field, message) => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...clubBranch,
      [field]: "",
    });
    expect(result.success).toBe(false);
    expect(errorFor(result, field)?.message).toBe(message);
  });

  it("does not ask for an external license", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...clubBranch,
    });
    expect(errorFor(result, "externalLicenseFileUrl")).toBeUndefined();
    expect(errorFor(result, "externalLicenseLabel")).toBeUndefined();
  });

  it("rejects invalid personal data", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...clubBranch,
      email: "bad",
    });
    expect(result.success).toBe(false);
  });
});

describe("registrationSchema — member only, license obtained elsewhere", () => {
  it("accepts a label plus an uploaded PDF, with no license selection", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...memberOnlyBranch,
    });
    expect(result.success).toBe(true);
  });

  it("does not ask for a license type, subtype or category", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...memberOnlyBranch,
    });
    for (const field of ["typeId", "subtypeId", "categoryId"]) {
      expect(errorFor(result, field)).toBeUndefined();
    }
  });

  it.each([["" as string], ["  "], ["A"]])(
    "rejects the label %p",
    (label) => {
      const result = registrationSchema.safeParse({
        ...validPersonalData,
        ...memberOnlyBranch,
        externalLicenseLabel: label,
      });
      expect(result.success).toBe(false);
      expect(errorFor(result, "externalLicenseLabel")?.message).toBe(
        "Indica la federación y el tipo de licencia",
      );
    },
  );

  it("rejects a missing PDF", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...memberOnlyBranch,
      externalLicenseFileUrl: "",
    });
    expect(result.success).toBe(false);
    expect(errorFor(result, "externalLicenseFileUrl")?.message).toBe(
      "Sube el PDF de tu licencia",
    );
  });

  // The admin panel turns this value into a clickable link, so a registrant
  // must not be able to point it anywhere but this app's own upload store.
  it.each([
    ["https://evil.example.com/licencia.pdf"],
    ["//evil.example.com/licencia.pdf"],
    ["/api/uploads/licenses/../../../etc/passwd"],
    ["/api/uploads/licenses/licencia.pdf.exe"],
    ["javascript:alert(1)"],
    ["/api/uploads/branding/logo.pdf"],
  ])("rejects %p as the uploaded file", (url) => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...memberOnlyBranch,
      externalLicenseFileUrl: url,
    });
    expect(result.success).toBe(false);
    expect(errorFor(result, "externalLicenseFileUrl")?.message).toBe(
      "Sube el PDF de tu licencia",
    );
  });

  it("still enforces personal data", () => {
    const result = registrationSchema.safeParse({
      ...validPersonalData,
      ...memberOnlyBranch,
      postalCode: "3",
    });
    expect(result.success).toBe(false);
  });
});
