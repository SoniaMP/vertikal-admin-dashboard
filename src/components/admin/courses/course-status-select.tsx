"use client";

import { useState, useTransition } from "react";
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
import { setCourseStatus } from "@/app/admin/(dashboard)/cursos/actions";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  DRAFT: "El curso dejará de ser visible en la web pública.",
  ACTIVE: "El curso será visible en la web pública y aceptará inscripciones.",
  INACTIVE: "El curso dejará de ser visible en la web pública.",
};

type Props = {
  courseId: string;
  status: string;
};

export function CourseStatusSelect({ courseId, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  function handleChange(value: string) {
    if (value === status) return;
    setPendingStatus(value);
  }

  function handleConfirm() {
    if (!pendingStatus) return;
    startTransition(async () => {
      await setCourseStatus(courseId, pendingStatus);
      setPendingStatus(null);
    });
  }

  return (
    <>
      <Select value={status} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-32" aria-label="Estado del curso">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog
        open={!!pendingStatus}
        onOpenChange={(open) => { if (!open) setPendingStatus(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cambiar estado a &ldquo;{STATUS_LABELS[pendingStatus ?? ""]}&rdquo;
            </AlertDialogTitle>
            <AlertDialogDescription>
              {STATUS_DESCRIPTIONS[pendingStatus ?? ""]}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Cambiando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
