"use client";

import { useState, useTransition } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  updateMembershipStatus,
  deleteMembership,
} from "@/app/admin/(dashboard)/registros/membership-actions";
import { MEMBERSHIP_STATUS } from "@/types";
import {
  MemberFormDialog,
  type MemberFormData,
} from "./member-form-dialog";

type Props = {
  membership: MemberFormData & { status: string };
};

export function MembershipActions({ membership }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const isCancelled = membership.status === MEMBERSHIP_STATUS.CANCELLED;

  function handleToggleStatus() {
    const nextStatus = isCancelled ? "ACTIVE" : "CANCELLED";
    startTransition(async () => {
      await updateMembershipStatus(membership.id, nextStatus);
    });
  }

  function handleDelete() {
    setDeleteError(undefined);
    startTransition(async () => {
      const result = await deleteMembership(membership.id);
      if (!result.success) {
        setDeleteError(result.error ?? "Error desconocido");
      } else {
        setIsDeleteOpen(false);
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost-info"
        size="icon"
        onClick={() => setIsEditOpen(true)}
        aria-label="Editar"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleToggleStatus}
        disabled={isPending}
        aria-label={isCancelled ? "Activar" : "Cancelar"}
      >
        <Power className="h-4 w-4" />
      </Button>
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Button
          type="button"
          variant="ghost-destructive"
          size="icon"
          disabled={isPending}
          aria-label="Eliminar"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar a &ldquo;{membership.firstName}{" "}
              {membership.lastName}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la membresía y todos sus
              datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <MemberFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        membership={membership}
      />
    </div>
  );
}
