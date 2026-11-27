// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FederationChip } from "../federation-chip";
import { retiredRowClass } from "@/helpers/retired-row-class";

describe("FederationChip", () => {
  it("reads as a reference, not as a state pill", () => {
    const { container } = render(
      <FederationChip name="FERM" isRetired={false} />,
    );
    const chip = container.firstElementChild as HTMLElement;

    // Square corner and a visible rule are what tell it apart from the
    // rounded, tinted pills that mean state in this panel.
    expect(chip.className).toContain("rounded-sm");
    expect(chip.className).toContain("border");
    expect(chip.className).not.toContain("rounded-full");
  });

  it("keeps a retired federation visible instead of dropping it", () => {
    render(<FederationChip name="FEDME" isRetired />);

    // An admin needs to see what would come back; a chip that vanished would
    // read as a link somebody removed.
    expect(screen.getByText("FEDME").className).toContain("line-through");
  });

  it("does not strike through a live one", () => {
    render(<FederationChip name="FERM" isRetired={false} />);

    expect(screen.getByText("FERM").className ?? "").not.toContain(
      "line-through",
    );
  });
});

describe("retiredRowClass", () => {
  it("leaves a live row on the normal ground", () => {
    expect(retiredRowClass(true)).toBe("");
  });

  it("sinks a retired row onto the same neutral as its Inactivo pill", () => {
    // Ground and label then say one thing instead of two.
    expect(retiredRowClass(false)).toContain("--pill-neutral-bg");
    expect(retiredRowClass(false)).toContain("text-muted-foreground");
  });
});
