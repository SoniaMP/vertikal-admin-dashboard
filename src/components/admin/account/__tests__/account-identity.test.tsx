// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccountIdentity } from "../account-identity";

describe("AccountIdentity", () => {
  it("pairs each label with its value", () => {
    render(
      <AccountIdentity
        name="Sonia Molina"
        email="sonia@clubvertikal.es"
        roleLabel="Administrador"
      />,
    );

    const rows = screen.getAllByRole("definition");
    expect(rows.map((row) => row.textContent)).toEqual([
      "Sonia Molina",
      "sonia@clubvertikal.es",
      "Administrador",
    ]);
  });

  it("shows a dash where the session has nothing", () => {
    render(<AccountIdentity name="—" email="—" roleLabel="Instructor" />);

    expect(screen.getAllByText("—")).toHaveLength(2);
  });
});
