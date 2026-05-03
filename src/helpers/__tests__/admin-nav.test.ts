import { describe, it, expect } from "vitest";
import { getActiveNavHref } from "../admin-nav";

const NAV_HREFS = [
  "/admin",
  "/admin/tipos-federacion",
  "/admin/cursos",
  "/admin/usuarios",
  "/admin/cuenta",
  "/admin/ajustes",
];

describe("getActiveNavHref", () => {
  it("returns /admin on the dashboard root", () => {
    expect(getActiveNavHref("/admin", NAV_HREFS)).toBe("/admin");
  });

  it("returns the longest matching prefix for a section root", () => {
    expect(getActiveNavHref("/admin/cursos", NAV_HREFS)).toBe("/admin/cursos");
  });

  it("returns the section prefix for a sub-route", () => {
    expect(getActiveNavHref("/admin/cursos/abc-123", NAV_HREFS)).toBe(
      "/admin/cursos",
    );
  });

  it("returns the section prefix for a deeply nested sub-route", () => {
    expect(
      getActiveNavHref("/admin/cursos/abc-123/export", NAV_HREFS),
    ).toBe("/admin/cursos");
  });

  it("falls back to /admin for routes only covered by the root", () => {
    expect(getActiveNavHref("/admin/registros/123", NAV_HREFS)).toBe("/admin");
  });

  it("matches federations correctly", () => {
    expect(getActiveNavHref("/admin/tipos-federacion", NAV_HREFS)).toBe(
      "/admin/tipos-federacion",
    );
  });

  it("does not match a sibling whose href is a non-boundary prefix", () => {
    expect(getActiveNavHref("/admin/cuentas", NAV_HREFS)).toBe("/admin");
  });

  it("matches /admin/cuenta exactly without leaking into /admin/cuentas", () => {
    expect(getActiveNavHref("/admin/cuenta", NAV_HREFS)).toBe("/admin/cuenta");
    expect(getActiveNavHref("/admin/cuentas/foo", NAV_HREFS)).toBe("/admin");
  });

  it("returns null when no item matches", () => {
    expect(getActiveNavHref("/somewhere-else", NAV_HREFS)).toBeNull();
  });

  it("returns null on empty hrefs", () => {
    expect(getActiveNavHref("/admin", [])).toBeNull();
  });
});
