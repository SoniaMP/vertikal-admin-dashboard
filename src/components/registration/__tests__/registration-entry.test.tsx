// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RegistrationEntry } from "../registration-entry";

function optionByName(name: string): HTMLElement {
  return screen.getByRole("link", { name: new RegExp(name) });
}

describe("RegistrationEntry", () => {
  it("offers the two ways in, each to its own flow", () => {
    render(<RegistrationEntry />);

    expect(optionByName("Alta nueva").getAttribute("href")).toBe(
      "/registro/alta",
    );
    expect(optionByName("Renovación").getAttribute("href")).toBe(
      "/registro/renovacion",
    );
  });

  it("gives the alta the filled block and the renovación the ground tone", () => {
    render(<RegistrationEntry />);

    expect(optionByName("Alta nueva").className).toContain(
      "bg-[var(--primary)]",
    );
    expect(optionByName("Renovación").className).toContain("bg-[var(--ground)]");
  });

  it("keeps the focus ring visible on the filled block", () => {
    render(<RegistrationEntry />);

    // A primary-coloured ring on the primary-coloured card is no ring at all.
    expect(optionByName("Alta nueva").className).toContain(
      "focus-visible:outline-[var(--lime)]",
    );
  });

  it("leaves the decorative icons out of assistive tech", () => {
    const { container } = render(<RegistrationEntry />);

    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(2);
    icons.forEach((icon) => {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    });
  });
});
