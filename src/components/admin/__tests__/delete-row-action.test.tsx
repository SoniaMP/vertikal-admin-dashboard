// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteRowAction } from "../delete-row-action";

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

function open(name = "Tarjeta impresa") {
  fireEvent.click(screen.getByRole("button", { name: `Eliminar ${name}` }));
}

describe("DeleteRowAction", () => {
  it("names the record in its label, so a column of bins is not all 'Eliminar'", () => {
    render(
      <DeleteRowAction name="Tarjeta impresa" onConfirm={vi.fn()}>
        Se borra para siempre.
      </DeleteRowAction>,
    );

    expect(
      screen.getByRole("button", { name: "Eliminar Tarjeta impresa" }),
    ).toBeTruthy();
  });

  it("asks before it deletes anything", () => {
    const onConfirm = vi.fn();
    render(
      <DeleteRowAction name="Tarjeta impresa" onConfirm={onConfirm}>
        Se borra para siempre.
      </DeleteRowAction>,
    );

    expect(onConfirm).not.toHaveBeenCalled();
    open();
    expect(screen.getByText("¿Eliminar «Tarjeta impresa»?")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("says on hover why the bin is off", () => {
    render(
      <DeleteRowAction
        name="Tarjeta impresa"
        onConfirm={vi.fn()}
        disabled
        reason="No se puede eliminar: hay membresías que lo incluyen"
      >
        Se borra para siempre.
      </DeleteRowAction>,
    );

    const bin = screen.getByRole("button", {
      name: "Eliminar Tarjeta impresa",
    });
    expect(bin.hasAttribute("disabled")).toBe(true);
    expect(bin.getAttribute("title")).toBe(
      "No se puede eliminar: hay membresías que lo incluyen",
    );
  });

  it("leaves a driven dialog open, because the refusal is read in it", () => {
    // The caller closes it once the server has answered; closing on click
    // would take the error away with the question.
    const onOpenChange = vi.fn();
    render(
      <DeleteRowAction
        name="Lucía Fernández"
        onConfirm={vi.fn()}
        open
        onOpenChange={onOpenChange}
        notice={<p>Este registro tiene un pago pendiente.</p>}
      >
        Se borra para siempre.
      </DeleteRowAction>,
    );

    expect(
      screen.getByText("Este registro tiene un pago pendiente."),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
