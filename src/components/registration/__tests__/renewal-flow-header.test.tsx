// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RenewalFlow } from "../renewal-flow";
import { RENEWAL_COPY } from "@/helpers/renewal-copy";

vi.mock("@/app/registro/renewal-actions", () => ({
  requestRenewalCode: vi.fn(),
  redeemRenewalCode: vi.fn(),
}));
vi.mock("@/app/registro/actions", () => ({ createRegistration: vi.fn() }));

describe("RenewalFlow header", () => {
  it("says it is a renewal, in its own words", () => {
    render(<RenewalFlow licenseTypes={[]} seasonYear={2026} membershipFee={0} />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      RENEWAL_COPY.title,
    );
  });

  it("prints the title once", () => {
    // The page used to render the header and then hand a second one to the
    // wizard, so the renewal showed its title twice.
    render(<RenewalFlow licenseTypes={[]} seasonYear={2026} membershipFee={0} />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
