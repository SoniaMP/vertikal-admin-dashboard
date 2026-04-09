"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { softDeleteCourse } from "@/app/admin/(dashboard)/cursos/actions";
import { CourseFormDialog } from "./course-form-dialog";
import type { CourseRow, CourseTypeOption, InstructorOption } from "./types";

type Props = {
  course: CourseRow;
  courseTypes: CourseTypeOption[];
  instructors?: InstructorOption[];
  isInstructor?: boolean;
};

export function CourseActionsMenu({ course, courseTypes, instructors, isInstructor }: Props) {
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
    <div className="flex items-center gap-1">
      {isActive && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          asChild
          aria-label="Ver página pública"
        >
          <a href={`/cursos/${course.slug}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
      {canEdit && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsEditOpen(true)}
          aria-label="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {!isInstructor && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isPending}
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Eliminar &ldquo;{course.title}&rdquo;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                El curso se marcará como eliminado y no será visible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <CourseFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        course={course}
        courseTypes={courseTypes}
        instructors={instructors}
      />
    </div>
  );
}
