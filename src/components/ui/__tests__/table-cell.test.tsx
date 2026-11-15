// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table, TableBody, TableCell, TableRow } from "../table";

/**
 * jsdom does no layout, so nothing ever reports itself as clipped. These stubs
 * stand in for the measurement the real browser does.
 */
function setClipping(isClipped: boolean) {
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get: () => (isClipped ? 500 : 100),
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 100,
  });
}

function renderCell(children: React.ReactNode) {
  return render(
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>{children}</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

afterEach(() => {
  // @ts-expect-error restoring the prototype jsdom shipped with
  delete HTMLElement.prototype.scrollWidth;
  // @ts-expect-error same
  delete HTMLElement.prototype.clientWidth;
});

describe("TableCell", () => {
  it("offers a tooltip when the text does not fit", () => {
    setClipping(true);
    const { container } = renderCell("Bartolomé de las Casas y Figueroa");

    expect(container.querySelector('[data-slot="tooltip-trigger"]')).not.toBeNull();
  });

  it("stays quiet when the text fits", () => {
    setClipping(false);
    const { container } = renderCell("Ana");

    expect(container.querySelector('[data-slot="tooltip-trigger"]')).toBeNull();
    expect(screen.getByText("Ana")).toBeTruthy();
  });

  // `<TableCell>{first} {last}</TableCell>` arrives as separate pieces, and a
  // full name is exactly what gets clipped.
  it("joins a name split across children", () => {
    setClipping(true);
    renderCell(
      <>
        {"Bartolomé"} {"de las Casas"}
      </>,
    );

    expect(screen.getByText("Bartolomé de las Casas")).toBeTruthy();
  });

  // A cell of buttons is not text to read: a tooltip on each action would be
  // noise, and wrapping them would break them.
  it("leaves a cell holding elements alone", () => {
    setClipping(true);
    const { container } = renderCell(<button type="button">Editar</button>);

    expect(container.querySelector('[data-slot="tooltip-trigger"]')).toBeNull();
    expect(screen.getByRole("button", { name: "Editar" })).toBeTruthy();
  });
});
