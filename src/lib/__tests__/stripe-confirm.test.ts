import { describe, it, expect, vi, beforeEach } from "vitest";
import { confirmCourseCheckout, confirmMembershipCheckout } from "../stripe-confirm";

const mockSessionRetrieve = vi.fn();
const mockCourseRegistrationUpdate = vi.fn();
const mockMembershipUpdate = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        retrieve: (...args: unknown[]) => mockSessionRetrieve(...args),
      },
    },
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseRegistration: {
      update: (...args: unknown[]) => mockCourseRegistrationUpdate(...args),
    },
    membership: {
      update: (...args: unknown[]) => mockMembershipUpdate(...args),
    },
  },
}));

describe("confirmCourseCheckout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when payment_status is not paid", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "unpaid",
      metadata: { courseRegistrationId: "creg-1" },
    });

    expect(await confirmCourseCheckout("cs_123")).toBeNull();
    expect(mockCourseRegistrationUpdate).not.toHaveBeenCalled();
  });

  it("returns null when metadata has no courseRegistrationId", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: {},
    });

    expect(await confirmCourseCheckout("cs_123")).toBeNull();
    expect(mockCourseRegistrationUpdate).not.toHaveBeenCalled();
  });

  it("updates registration and returns confirmation data on success", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { courseRegistrationId: "creg-1" },
      payment_intent: "pi_abc",
    });
    mockCourseRegistrationUpdate.mockResolvedValue({
      firstName: "María",
      lastName: "López",
      email: "maria@test.com",
      courseCatalog: { title: "Escalada nivel 1" },
      coursePrice: { name: "General", amountCents: 5000 },
    });

    const result = await confirmCourseCheckout("cs_123");

    expect(result).toEqual({
      firstName: "María",
      lastName: "López",
      email: "maria@test.com",
      courseTitle: "Escalada nivel 1",
      priceName: "General",
      amountCents: 5000,
    });
    expect(mockCourseRegistrationUpdate).toHaveBeenCalledWith({
      where: { id: "creg-1" },
      data: {
        paymentStatus: "COMPLETED",
        stripePaymentIntentId: "pi_abc",
      },
      include: {
        courseCatalog: { select: { title: true } },
        coursePrice: { select: { name: true, amountCents: true } },
      },
    });
  });
});

describe("confirmMembershipCheckout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when payment_status is not paid", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "unpaid",
      metadata: { membershipId: "ms-1" },
    });

    expect(await confirmMembershipCheckout("cs_456")).toBeNull();
    expect(mockMembershipUpdate).not.toHaveBeenCalled();
  });

  it("updates membership and returns confirmation data on success", async () => {
    mockSessionRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { membershipId: "ms-1" },
      payment_intent: "pi_xyz",
    });

    const mockMember = {
      firstName: "Juan",
      lastName: "García",
      email: "juan@test.com",
      phone: "612345678",
      dni: "12345678A",
      dateOfBirth: "1990-01-15",
      address: "Calle Mayor 1",
      city: "Madrid",
      postalCode: "28001",
      province: "Madrid",
    };

    mockMembershipUpdate.mockResolvedValue({
      member: mockMember,
      licenseLabelSnapshot: "Competición - Nacional - Senior",
      totalAmount: 15000,
      supplements: [
        { supplement: { name: "Seguro extra" } },
      ],
    });

    const result = await confirmMembershipCheckout("cs_456");

    expect(result).toEqual({
      member: mockMember,
      licenseLabel: "Competición - Nacional - Senior",
      totalAmount: 15000,
      supplements: [{ name: "Seguro extra" }],
    });

    expect(mockMembershipUpdate).toHaveBeenCalledWith({
      where: { id: "ms-1" },
      data: {
        paymentStatus: "COMPLETED",
        status: "ACTIVE",
        stripePaymentId: "pi_xyz",
      },
      include: {
        member: true,
        supplements: { include: { supplement: true } },
      },
    });
  });
});
