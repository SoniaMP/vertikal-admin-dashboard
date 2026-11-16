// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseMetricsStrip } from "../course-metrics";

const FULL_HOUSE = {
  enrolled: 9,
  pending: 2,
  revenue: 405,
  capacity: 12,
  free: 3,
};

describe("CourseMetricsStrip", () => {
  it("reads the course the way the season's strip reads", () => {
    render(<CourseMetricsStrip metrics={FULL_HOUSE} />);

    expect(screen.getByText("Inscritos")).toBeTruthy();
    expect(screen.getByText("9")).toBeTruthy();
    expect(screen.getByText("de 12")).toBeTruthy();
    expect(screen.getByText("75% del aforo")).toBeTruthy();
  });

  it("counts what is not yet paid apart from what holds a place", () => {
    render(<CourseMetricsStrip metrics={FULL_HOUSE} />);

    const pending = screen.getByText("Pendientes de pago").parentElement;
    expect(pending?.textContent).toContain("2");

    const free = screen.getByText("Plazas libres").parentElement;
    expect(free?.textContent).toContain("3");
  });

  it("draws no share for a course nobody has signed up to", () => {
    render(
      <CourseMetricsStrip
        metrics={{ enrolled: 0, pending: 0, revenue: 0, capacity: 12, free: 12 }}
      />,
    );

    expect(screen.getByText("0% del aforo")).toBeTruthy();
    expect(screen.getByText("0,00 €")).toBeTruthy();
  });

  it("survives a course with no capacity set", () => {
    render(
      <CourseMetricsStrip
        metrics={{ enrolled: 0, pending: 0, revenue: 0, capacity: 0, free: 0 }}
      />,
    );

    expect(screen.getByText("0% del aforo")).toBeTruthy();
  });
});
