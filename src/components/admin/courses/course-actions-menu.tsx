"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { DeleteRowAction } from "@/components/admin/delete-row-action";
import { RowActionButton } from "@/components/admin/row-action-button";
import { RowActions } from "@/components/admin/row-actions";
import { softDeleteCourse } from "@/app/admin/(dashboard)/cursos/actions";
import { CourseFormDialog } from "./course-form-dialog";
import type { CourseRow, CourseTypeOption, InstructorOption } from "./types";

type Props = {
  course: CourseRow;
  courseTypes: CourseTypeOption[];
  instructors?: InstructorOption[];
  isInstructor?: boolean;
};

export function CourseActionsMenu({
  course,
  courseTypes,
  instructors,
  isInstructor,
}: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await softDeleteCourse(course.id);
    });
  }

  const isActive = course.status === "ACTIVE";
  const canEdit = !isInstructor || isActive;

  return (
    <RowActions>
      {isActive && (
        <RowActionButton asChild aria-label="Ver página pública">
          <a href={`/cursos/${course.slug}`} target="_blank" rel="noreferrer">
            <ExternalLink />
          </a>
        </RowActionButton>
      )}
      {canEdit && (
        <RowActionButton
          onClick={() => setIsEditOpen(true)}
          aria-label="Editar"
        >
          <Pencil />
        </RowActionButton>
      )}
      {!isInstructor && (
        <DeleteRowAction
          name={course.title}
          onConfirm={handleDelete}
          isPending={isPending}
        >
          El curso se marcará como eliminado y no será visible.
        </DeleteRowAction>
      )}
      <CourseFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        course={course}
        courseTypes={courseTypes}
        instructors={instructors}
        isAdmin={!isInstructor}
      />
    </RowActions>
  );
}
