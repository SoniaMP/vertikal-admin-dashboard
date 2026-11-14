// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MembershipActions } from "../membership-actions";

vi.mock("@/app/admin/(dashboard)/registros/membership-actions", () => ({
  updateMembership: vi.fn(),
  updateMembershipStatus: vi.fn(),
  deleteMembership: vi.fn(),
}));

const MEMBERSHIP = {
  id: "ms-1",
  firstName: "Lucía",
  lastName: "Fernández",
  email: "lucia@example.com",
  phone: "612345678",
  dni: "12345678A",
  dateOfBirth: "1990-01-01",
  sex: "F",
  address: "Calle Mayor 1",
  city: "Murcia",
  postalCode: "30001",
  province: "Murcia",
  status: "ACTIVE",
  paymentStatus: "COMPLETED",
};

const WARNING = /pago pendiente/i;

function openDeleteDialog(paymentStatus: string) {
  render(<MembershipActions membership={{ ...MEMBERSHIP, paymentStatus }} />);
  fireEvent.click(screen.getByLabelText("Eliminar"));
}

describe("MembershipActions delete dialog", () => {
  it("warns that deleting a pending registration can orphan a payment", () => {
    openDeleteDialog("PENDING");

    expect(screen.getByText(WARNING)).toBeTruthy();
  });

  it("stays quiet when the payment is already completed", () => {
    openDeleteDialog("COMPLETED");

    expect(screen.queryByText(WARNING)).toBeNull();
  });

  it("deletes anyway, because pending junk has to be removable", () => {
    openDeleteDialog("PENDING");

    expect(
      screen.getByRole("button", { name: "Eliminar" }).hasAttribute("disabled"),
    ).toBe(false);
  });
});
