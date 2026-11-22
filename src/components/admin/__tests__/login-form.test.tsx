// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const loginAction = vi.fn();

vi.mock("@/app/admin/login/actions", () => ({
  loginAction: (...args: unknown[]) => loginAction(...args),
}));

const { LoginForm } = await import("../login-form");

const EXPIRY_NOTICE = "Tu sesión ha caducado por inactividad";
const WRONG_CREDENTIALS = "Email o contraseña incorrectos";

describe("LoginForm", () => {
  it("says nothing about sessions on a plain visit", () => {
    render(<LoginForm />);
    expect(screen.queryByText(EXPIRY_NOTICE, { exact: false })).toBeNull();
  });

  it("explains the bounce when the session ran out", () => {
    render(<LoginForm hasExpiredSession />);

    expect(screen.getByRole("status").textContent).toContain(EXPIRY_NOTICE);
  });

  /**
   * The form posts back to the same URL, so `?expired=1` is still there after
   * a failed attempt. Two messages at once read as two separate problems.
   */
  it("drops the notice once there is a credentials error to show", async () => {
    loginAction.mockResolvedValue({ error: WRONG_CREDENTIALS });
    render(<LoginForm hasExpiredSession />);

    const form = screen
      .getByRole("button", { name: "Iniciar sesión" })
      .closest("form")!;
    fireEvent.submit(form);

    expect((await screen.findByRole("alert")).textContent).toContain(
      WRONG_CREDENTIALS,
    );
    expect(screen.queryByRole("status")).toBeNull();
  });
});
