"use client";

import {
  startTransition,
  SyntheticEvent,
  useActionState,
  useEffect,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  createCourse,
  updateCourse,
} from "@/app/admin/(dashboard)/cursos/actions";
import { CourseFormFields } from "./course-form-fields";
import { CoursePriceList, type PriceRow } from "./course-price-list";
import type { CourseRow, CourseTypeOption, InstructorOption } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: CourseRow;
  courseTypes: CourseTypeOption[];
  instructors?: InstructorOption[];
};

const INITIAL_STATE = { success: false, error: undefined };

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  courseTypes,
  instructors,
}: Props) {
  const isEditing = !!course;

  const action = isEditing ? updateCourse.bind(null, course.id) : createCourse;

  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [prices, setPrices] = useState<PriceRow[]>(course?.prices ?? []);

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state, onOpenChange]);

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar curso" : "Nuevo curso"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="hidden"
            name="pricesJson"
            value={JSON.stringify(prices)}
          />
          <CourseFormFields
            course={course}
            courseTypes={courseTypes}
            instructors={instructors}
          />
          <CoursePriceList
            defaultPrices={course?.prices}
            onChange={setPrices}
          />
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
