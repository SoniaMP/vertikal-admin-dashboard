import { describe, expect, it } from "vitest";
import { formatUserRolesFinding } from "../user-roles-finding";

describe("formatUserRolesFinding", () => {
  it("counts each role by what it is called", () => {
    expect(
      formatUserRolesFinding(["ADMIN", "ADMIN", "INSTRUCTOR"]),
    ).toBe("2 administradores y 1 instructor con acceso al panel.");
  });

  it("uses the singular for a lone admin", () => {
    expect(formatUserRolesFinding(["ADMIN"])).toBe(
      "1 administradora o administrador con acceso al panel.",
    );
  });

  it("lists three roles with commas and a final y", () => {
    expect(
      formatUserRolesFinding(["ADMIN", "INSTRUCTOR", "INSTRUCTOR", "TESORERO"]),
    ).toBe("1 administradora o administrador, 2 instructores y 1 TESORERO con acceso al panel.");
  });

  it("says so when nobody has access", () => {
    expect(formatUserRolesFinding([])).toBe(
      "Nadie tiene acceso al panel todavía.",
    );
  });
});
