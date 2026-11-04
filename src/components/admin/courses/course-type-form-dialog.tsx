"use client";

import { useActionState, useEffect, useRef } from "react";
import type { CourseTypeOption } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCourseType,
  updateCourseType,
} from "@/app/admin/(dashboard)/cursos/actions";
import type { CreateCourseTypeResult } from "@/app/admin/(dashboard)/cursos/actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseType?: CourseTypeOption;
  onCreated?: (courseType: CourseTypeOption) => void;
};

const INITIAL_STATE = { success: false, error: undefined };

export function CourseTypeFormDialog({
  open,
  onOpenChange,
  courseType,
  onCreated,
}: Props) {
  const isEditing = !!courseType;

  const action = isEditing
    ? updateCourseType.bind(null, courseType.id)
    : createCourseType;

  const [state, formAction, isPending] = useActionState<
    CreateCourseTypeResult,
    FormData
  >(action, INITIAL_STATE);

  // Each result is handled once. Without this guard, a caller passing a fresh
  // `onCreated` on every render would re-trigger the effect through its own
  // state update and loop forever.
  const handledResult = useRef<CreateCourseTypeResult | null>(null);

  useEffect(() => {
    if (!state.success || handledResult.current === state) return;
    handledResult.current = state;
    if (state.createdCourseType) onCreated?.(state.createdCourseType);
    onOpenChange(false);
  }, [state, onCreated, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar tipo de curso"
              : "Nuevo tipo de curso"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={formAction}
          // This dialog is portaled out of the DOM, but it is still a child of
          // the course form in the React tree, and React bubbles events along
          // that tree. Without this, saving a category would submit the course
          // form instead and swallow this action.
          onSubmit={(event) => event.stopPropagation()}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={courseType?.name ?? ""}
              required
              minLength={2}
            />
          </div>
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
