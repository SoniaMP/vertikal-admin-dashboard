// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { CourseFormDialog } from "../course-form-dialog";
import type { CourseTypeOption } from "../types";
import type { CreateCourseTypeResult } from "@/app/admin/(dashboard)/cursos/actions";
import type { ActionResult } from "@/lib/actions";

// Typed like the real actions, so the submitted FormData can be inspected.
const { createCourseMock, createCourseTypeMock } = vi.hoisted(() => ({
  createCourseMock: vi.fn(
    (_prevState: ActionResult, _formData: FormData): ActionResult => ({
      success: false,
    }),
  ),
  createCourseTypeMock: vi.fn(
    (
      _prevState: ActionResult,
      _formData: FormData,
    ): CreateCourseTypeResult => ({ success: false }),
  ),
}));

vi.mock("@/app/admin/(dashboard)/cursos/actions", () => ({
  createCourse: createCourseMock,
  updateCourse: vi.fn(),
  createCourseType: createCourseTypeMock,
  updateCourseType: vi.fn(),
}));

// Deliberately unsorted, so the options are also checked to come out by name.
const COURSE_TYPES: CourseTypeOption[] = [
  { id: "type-escalada", name: "Escalada" },
  { id: "type-alpinismo", name: "Alpinismo" },
];

function submittedCourseField(field: string) {
  return createCourseMock.mock.calls[0]?.[1].get(field);
}

function renderDialog() {
  return render(
    <CourseFormDialog
      open
      onOpenChange={vi.fn()}
      courseTypes={COURSE_TYPES}
      isAdmin
    />,
  );
}

function openCategoryDialog() {
  fireEvent.click(screen.getByRole("button", { name: "Nueva categoría" }));
  return screen.getByRole("dialog", { name: "Nuevo tipo de curso" });
}

describe("CourseFormDialog", () => {
  beforeEach(() => {
    createCourseMock.mockClear();
    createCourseTypeMock.mockClear();
  });

  it("saving a new category does not submit the course form", async () => {
    renderDialog();
    const categoryDialog = openCategoryDialog();

    fireEvent.change(within(categoryDialog).getByLabelText("Nombre"), {
      target: { value: "Alpinismo" },
    });
    fireEvent.click(within(categoryDialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(createCourseTypeMock).toHaveBeenCalledTimes(1));
    expect(createCourseMock).not.toHaveBeenCalled();
  });

  it("submits no category when the category select is untouched", async () => {
    renderDialog();
    const courseDialog = screen.getByRole("dialog", { name: "Nuevo curso" });

    fireEvent.click(within(courseDialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(createCourseMock).toHaveBeenCalledTimes(1));
    // Radix's hidden native select would have fallen back to the first option
    // here, saving a category nobody picked.
    expect(submittedCourseField("courseTypeId")).toBe("");
  });

  it("selects and submits a category created from the inline dialog", async () => {
    createCourseTypeMock.mockReturnValueOnce({
      success: true,
      createdCourseType: { id: "type-new", name: "Barrancos" },
    });

    renderDialog();
    const categoryDialog = openCategoryDialog();
    fireEvent.change(within(categoryDialog).getByLabelText("Nombre"), {
      target: { value: "Barrancos" },
    });
    fireEvent.click(within(categoryDialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Nuevo tipo de curso" }),
      ).toBeNull(),
    );
    expect(screen.getByRole("combobox").textContent).toContain("Barrancos");

    const courseDialog = screen.getByRole("dialog", { name: "Nuevo curso" });
    fireEvent.click(within(courseDialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(createCourseMock).toHaveBeenCalledTimes(1));
    expect(submittedCourseField("courseTypeId")).toBe("type-new");
  });

  it("submits the course form from its own save button", async () => {
    renderDialog();
    const courseDialog = screen.getByRole("dialog", { name: "Nuevo curso" });

    fireEvent.click(within(courseDialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(createCourseMock).toHaveBeenCalledTimes(1));
    expect(createCourseTypeMock).not.toHaveBeenCalled();
  });
});
