// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LicenseTypeChecklist } from "../license-type-checklist";

const CLIMBING = {
  id: "t1",
  name: "Escalada",
  active: true,
  publishedAt: new Date("2026-01-01"),
};
const DRAFT = { id: "t2", name: "Alpinismo", active: true, publishedAt: null };
const RETIRED = {
  id: "t3",
  name: "Esquí",
  active: false,
  publishedAt: new Date("2026-01-01"),
};

/** What the form would actually submit: the checkbox is Radix, so the value
    reaches the action through the hidden fields, not through the control. */
function submittedTypeIds(container: HTMLElement): string[] {
  return [...container.querySelectorAll('input[name="typeIds"]')].map(
    (input) => (input as HTMLInputElement).value,
  );
}

describe("LicenseTypeChecklist", () => {
  it("submits the federations the extra is already offered in", () => {
    const { container } = render(
      <LicenseTypeChecklist
        types={[CLIMBING, DRAFT]}
        selectedTypeIds={["t1"]}
      />,
    );

    expect(submittedTypeIds(container)).toEqual(["t1"]);
  });

  it("submits a federation once it is ticked", () => {
    const { container } = render(
      <LicenseTypeChecklist types={[CLIMBING, DRAFT]} selectedTypeIds={[]} />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /Escalada/ }));

    expect(submittedTypeIds(container)).toEqual(["t1"]);
  });

  it("stops submitting one that is unticked", () => {
    const { container } = render(
      <LicenseTypeChecklist
        types={[CLIMBING, DRAFT]}
        selectedTypeIds={["t1", "t2"]}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /Escalada/ }));

    expect(submittedTypeIds(container)).toEqual(["t2"]);
  });

  it("offers a draft federation, marked as one", () => {
    render(
      <LicenseTypeChecklist types={[CLIMBING, DRAFT]} selectedTypeIds={[]} />,
    );

    expect(screen.getByText("(borrador)")).toBeDefined();
  });

  it("offers a retired federation, marked as one", () => {
    render(<LicenseTypeChecklist types={[RETIRED]} selectedTypeIds={[]} />);

    expect(screen.getByText("(retirada)")).toBeDefined();
  });

  it("warns when nothing is ticked, because then it sells nowhere", () => {
    render(<LicenseTypeChecklist types={[CLIMBING]} selectedTypeIds={[]} />);

    expect(
      screen.getByText("Sin ninguna marcada no se ofrece en ningún sitio."),
    ).toBeDefined();
  });

  it("says so when the year has no federations at all", () => {
    const { container } = render(
      <LicenseTypeChecklist types={[]} selectedTypeIds={[]} />,
    );

    expect(screen.getByText(/todavía no tiene federativas/)).toBeDefined();
    expect(submittedTypeIds(container)).toEqual([]);
  });
});
