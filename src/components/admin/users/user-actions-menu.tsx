"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { DeleteRowAction } from "@/components/admin/delete-row-action";
import { RowActionButton } from "@/components/admin/row-action-button";
import { RowActions } from "@/components/admin/row-actions";
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
    <RowActions>
      <RowActionButton onClick={() => setIsEditOpen(true)} aria-label="Editar">
        <Pencil />
      </RowActionButton>
      <DeleteRowAction
        name={user.name}
        onConfirm={handleDelete}
        disabled={isSelf || isPending}
        reason={isSelf ? "No puedes eliminar tu propia cuenta" : undefined}
      >
        Esta acción no se puede deshacer. El usuario perderá acceso al panel.
      </DeleteRowAction>
      <UserFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={user}
      />
    </RowActions>
  );
}
