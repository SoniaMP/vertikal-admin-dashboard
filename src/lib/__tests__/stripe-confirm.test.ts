import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchCourseConfirmation,
  fetchMembershipConfirmation,
} from "../stripe-confirm";

const mockSessionRetrieve = vi.fn();
const mockCourseRegistrationFindUnique = vi.fn();
const mockMembershipFindUnique = vi.fn();
const forbiddenWrite = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        retrieve: (...args: unknown[]) => mockSessionRetrieve(...args),
      },
    },
  }),
}));

// `update` is wired to a spy that must never fire: these pages read, and the
// webhook is the only writer. A write here would mark a membership as paid
// without anyone sending the confirmation that goes with it.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseRegistration: {
      findUnique: (...args: unknown[]) =>
        mockCourseRegistrationFindUnique(...args),
      update: (...args: unknown[]) => forbiddenWrite(...args),
    },
    membership: {
      findUnique: (...args: unknown[]) => mockMembershipFindUnique(...args),
      update: (...args: unknown[]) => forbiddenWrite(...args),
    },
  },
}));

const MEMBER = {
  firstName: "Juan",
  lastName: "García",
  email: "juan@test.com",
  phone: "612345678",
  dni: "12345678A",
  dateOfBirth: "1990-01-15",
  sex: "M",
  address: "Calle Mayor 1",
  city: "Madrid",
  postalCode: "28001",
  province: "Madrid",
};

describe("fetchCourseConfirmation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when the session was not paid", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "unpaid",
      metadata: { courseRegistrationId: "creg-1" },
    });

    expect(await fetchCourseConfirmation("cs_123")).toBeNull();
    expect(mockCourseRegistrationFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when the session carries no registration id", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: {},
    });

    expect(await fetchCourseConfirmation("cs_123")).toBeNull();
    expect(mockCourseRegistrationFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when the registration is no longer in the database", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { courseRegistrationId: "creg-gone" },
    });
    mockCourseRegistrationFindUnique.mockResolvedValue(null);

    expect(await fetchCourseConfirmation("cs_123")).toBeNull();
  });

  it("reads the registration without writing to it", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { courseRegistrationId: "creg-1" },
      payment_intent: "pi_abc",
    });
    mockCourseRegistrationFindUnique.mockResolvedValue({
      firstName: "María",
      lastName: "López",
      email: "maria@test.com",
      courseCatalog: { title: "Escalada nivel 1" },
      coursePrice: { name: "General", amountCents: 5000 },
    });

    const result = await fetchCourseConfirmation("cs_123");

    expect(result).toEqual({
      firstName: "María",
      lastName: "López",
      email: "maria@test.com",
      courseTitle: "Escalada nivel 1",
      priceName: "General",
      amountCents: 5000,
    });
    expect(mockCourseRegistrationFindUnique).toHaveBeenCalledWith({
      where: { id: "creg-1" },
      include: {
        courseCatalog: { select: { title: true } },
        coursePrice: { select: { name: true, amountCents: true } },
      },
    });
    expect(forbiddenWrite).not.toHaveBeenCalled();
  });
});

describe("fetchMembershipConfirmation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when the session was not paid", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "unpaid",
      metadata: { membershipId: "ms-1" },
    });

    expect(await fetchMembershipConfirmation("cs_456")).toBeNull();
    expect(mockMembershipFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when the membership is no longer in the database", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { membershipId: "ms-gone" },
    });
    mockMembershipFindUnique.mockResolvedValue(null);

    expect(await fetchMembershipConfirmation("cs_456")).toBeNull();
  });

  it("reads the membership without writing to it", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { membershipId: "ms-1" },
      payment_intent: "pi_xyz",
    });
    mockMembershipFindUnique.mockResolvedValue({
      member: MEMBER,
      hasClubLicense: true,
      licenseLabelSnapshot: "Competición - Nacional - Senior",
      externalLicenseLabel: null,
      totalAmount: 15000,
      supplements: [{ supplement: { name: "Seguro extra" } }],
    });

    const result = await fetchMembershipConfirmation("cs_456");

    expect(result).toEqual({
      member: MEMBER,
      licenseLabel: "Competición - Nacional - Senior",
      externalLicenseLabel: null,
      totalAmount: 15000,
      supplements: [{ name: "Seguro extra" }],
    });
    expect(mockMembershipFindUnique).toHaveBeenCalledWith({
      where: { id: "ms-1" },
      include: {
        member: true,
        supplements: { include: { supplement: true } },
      },
    });
    expect(forbiddenWrite).not.toHaveBeenCalled();
  });

  // The member who paid before the webhook landed still sees their summary:
  // nothing on the page comes from the payment columns.
  it("shows the summary even while the payment is still pending", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { membershipId: "ms-1" },
    });
    mockMembershipFindUnique.mockResolvedValue({
      member: MEMBER,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
      hasClubLicense: true,
      licenseLabelSnapshot: "Competición - Nacional - Senior",
      externalLicenseLabel: null,
      totalAmount: 15000,
      supplements: [],
    });

    const result = await fetchMembershipConfirmation("cs_456");

    expect(result?.member).toEqual(MEMBER);
    expect(result?.totalAmount).toBe(15000);
  });

  // The success page prints `licenseLabel` as the license it sold. A member who
  // federates elsewhere bought no license, so the snapshot must not leak there.
  it("reports no club license when the member federates elsewhere", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { membershipId: "ms-2" },
    });
    mockMembershipFindUnique.mockResolvedValue({
      member: {},
      hasClubLicense: false,
      licenseLabelSnapshot: "",
      externalLicenseLabel: "FERM PLUS A",
      totalAmount: 2000,
      supplements: [],
    });

    const result = await fetchMembershipConfirmation("cs_789");

    expect(result?.licenseLabel).toBeNull();
    expect(result?.externalLicenseLabel).toBe("FERM PLUS A");
  });
});
