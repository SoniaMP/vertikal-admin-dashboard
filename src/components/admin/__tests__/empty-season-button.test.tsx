// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EmptySeasonButton } from "../empty-season-button";

vi.mock(
  "@/app/admin/(dashboard)/tipos-federacion/actions/empty-season-catalog",
  () => ({ emptySeasonCatalog: vi.fn() }),
);

function openDialog(isActiveYear: boolean) {
  render(<EmptySeasonButton year={2027} isActiveYear={isActiveYear} />);
  fireEvent.click(screen.getByRole("button", { name: /Vaciar 2027/ }));
  return screen.getByRole("alertdialog");
}

describe("EmptySeasonButton", () => {
  it("warns that the club stops selling licences when the year is in force", () => {
    const dialog = openDialog(true);

    expect(dialog.textContent).toContain("nadie podrá federarse con el club");
  });

  it("does not raise that warning for a year still to come", () => {
    const dialog = openDialog(false);

    expect(dialog.textContent).not.toContain("nadie podrá federarse");
    expect(dialog.textContent).toContain("No se puede deshacer");
  });
});
