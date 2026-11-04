"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CourseTypeField } from "./course-type-field";
import type { CourseRow, CourseTypeOption, InstructorOption } from "./types";

type Props = {
  course?: CourseRow;
  courseTypes: CourseTypeOption[];
  instructors?: InstructorOption[];
};

function toDateOnlyInputValue(date: Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

const NONE_VALUE = "__none__";

export function CourseFormFields({ course, courseTypes, instructors }: Props) {
  const [directorId, setDirectorId] = useState(
    course?.instructor?.id ?? NONE_VALUE,
  );
  const [pendingDirectorId, setPendingDirectorId] = useState<string | null>(
    null,
  );

  const hasExistingDirector = !!course?.instructor;

  function handleDirectorChange(value: string) {
    if (hasExistingDirector && value !== directorId) {
      setPendingDirectorId(value);
    } else {
      setDirectorId(value);
    }
  }

  function confirmDirectorChange() {
    if (pendingDirectorId) {
      setDirectorId(pendingDirectorId);
      setPendingDirectorId(null);
    }
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={course?.title ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="mi-curso-ejemplo"
          defaultValue={course?.slug ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Letras, números y guiones. Sin espacios. Se usa en la URL pública.
        </p>
      </div>
      <CourseTypeField
        courseTypes={courseTypes}
        defaultCourseTypeId={course?.courseType.id}
      />
      <div className="space-y-2">
        <Label htmlFor="courseDate">Fecha</Label>
        <Input
          id="courseDate"
          name="courseDate"
          type="date"
          defaultValue={
            course?.courseDate ? toDateOnlyInputValue(course.courseDate) : ""
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registrationDeadline">Plazo de inscripción</Label>
        <Input
          id="registrationDeadline"
          name="registrationDeadline"
          type="date"
          defaultValue={
            course?.registrationDeadline
              ? toDateOnlyInputValue(course.registrationDeadline)
              : ""
          }
        />
        <p className="text-xs text-muted-foreground">
          Las inscripciones cierran a las 23:59 del día seleccionado. Debe ser
          anterior o igual a la fecha del curso.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxCapacity">Capacidad máxima</Label>
        <Input
          id="maxCapacity"
          name="maxCapacity"
          type="number"
          min={1}
          defaultValue={course?.maxCapacity ?? ""}
        />
      </div>
      {instructors && instructors.length > 0 && (
        <>
          <input
            type="hidden"
            name="instructorId"
            value={directorId === NONE_VALUE ? "" : directorId}
          />
          <div className="space-y-2">
            <Label htmlFor="instructorId">Director</Label>
            <Select value={directorId} onValueChange={handleDirectorChange}>
              <SelectTrigger id="instructorId">
                <SelectValue placeholder="Sin director asignado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Sin director</SelectItem>
                {instructors.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialog
            open={!!pendingDirectorId}
            onOpenChange={(open) => {
              if (!open) setPendingDirectorId(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cambiar director</AlertDialogTitle>
                <AlertDialogDescription>
                  Este curso ya tiene un director asignado ({course?.instructor?.name}).
                  ¿Quieres cambiarlo?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDirectorChange}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}
