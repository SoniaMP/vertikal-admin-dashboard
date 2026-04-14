"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import { deleteUser } from "@/app/admin/(dashboard)/usuarios/actions";
import { UserFormDialog, type UserFormData } from "./user-form-dialog";

type Props = {
  user: UserFormData;
  isSelf: boolean;
};

export function UserActionsMenu({ user, isSelf }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteUser(user.id);
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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost-destructive"
            size="icon"
            disabled={isSelf || isPending}
            aria-label="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar a &ldquo;{user.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario perderá acceso al
              panel.
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
      <UserFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={user}
      />
    </div>
  );
}
