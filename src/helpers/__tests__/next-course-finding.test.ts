import { describe, expect, it } from "vitest";
import { formatNextCourseFinding } from "../next-course-finding";

const COURSE = {
  title: "Iniciación a la escalada",
  courseDate: new Date("2026-12-12T09:00:00Z"),
  taken: 8,
  capacity: 12,
};

describe("formatNextCourseFinding", () => {
  it("names the next course, when it is and what is left", () => {
    expect(formatNextCourseFinding(COURSE)).toBe(
      "El próximo es «Iniciación a la escalada», el 12 de diciembre: quedan 4 plazas de 12.",
    );
  });

  it("counts a single free place in the singular", () => {
    expect(formatNextCourseFinding({ ...COURSE, taken: 11 })).toBe(
      "El próximo es «Iniciación a la escalada», el 12 de diciembre: queda 1 plaza de 12.",
    );
  });

  it("says it is full rather than offering zero places", () => {
    expect(formatNextCourseFinding({ ...COURSE, taken: 12 })).toBe(
      "El próximo es «Iniciación a la escalada», el 12 de diciembre, y está lleno.",
    );
  });

  it("does not invent a course when there is none ahead", () => {
    expect(formatNextCourseFinding(null)).toBe(
      "No hay cursos publicados a partir de hoy.",
    );
  });
});
