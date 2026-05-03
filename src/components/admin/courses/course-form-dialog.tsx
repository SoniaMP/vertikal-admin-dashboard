"use client";

import {
  startTransition,
  SyntheticEvent,
  useActionState,
  useEffect,
  useState,
} from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  isAdmin: boolean;
};

const INITIAL_STATE = { success: false, error: undefined };
const INSTRUCTOR_PUBLISH_TOOLTIP = "La publicación la realiza un administrador.";

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  courseTypes,
  instructors,
  isAdmin,
}: Props) {
  const isEditing = !!course;

  const action = isEditing ? updateCourse.bind(null, course.id) : createCourse;

  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [prices, setPrices] = useState<PriceRow[]>(course?.prices ?? []);
  const [published, setPublished] = useState(course?.status === "ACTIVE");

  const publishSwitch = (
    <Switch
      id="publish-toggle"
      checked={published}
      onCheckedChange={setPublished}
      disabled={!isAdmin}
      aria-label={published ? "Despublicar curso" : "Publicar curso"}
    />
  );

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state, onOpenChange]);

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] sm:max-w-4xl overflow-y-auto"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>
              {isEditing ? "Editar curso" : "Nuevo curso"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                publishSwitch
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">{publishSwitch}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {INSTRUCTOR_PUBLISH_TOOLTIP}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Label
                htmlFor="publish-toggle"
                className="text-sm font-normal text-muted-foreground"
              >
                {published ? "Publicado" : "Borrador"}
              </Label>
              <DialogClose
                aria-label="Cerrar"
                className="ml-2 inline-flex size-7 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <X className="size-4" />
              </DialogClose>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="hidden"
            name="pricesJson"
            value={JSON.stringify(prices)}
          />
          <input
            type="hidden"
            name="published"
            value={published ? "true" : "false"}
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
