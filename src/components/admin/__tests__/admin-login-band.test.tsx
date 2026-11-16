// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminLoginBand } from "../admin-login-band";

vi.mock("next/image", () => ({
  // `priority` is Next's own prop and React warns if it reaches the DOM.
  default: ({ priority, ...props }: Record<string, unknown>) => {
    void priority;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("AdminLoginBand", () => {
  it("carries the club's mark, turned white for the colour field", () => {
    render(<AdminLoginBand seasonLabel="Temporada 2026 / 2027" />);

    const mark = screen.getByAltText("Club Vertikal");
    expect(mark.className).toContain("invert");
  });

  it("names the season when there is one", () => {
    render(<AdminLoginBand seasonLabel="Temporada 2026 / 2027" />);

    expect(screen.getByText("Temporada 2026 / 2027")).toBeTruthy();
  });

  it("says nothing when no season is configured", () => {
    render(<AdminLoginBand seasonLabel={null} />);

    expect(screen.queryByText(/Temporada/)).toBeNull();
  });
});
