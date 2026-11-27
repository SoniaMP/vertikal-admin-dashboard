"use client";

import { useState, useTransition } from "react";
import { Pencil, Power } from "lucide-react";
import { DeleteRowAction } from "./delete-row-action";
import { RowActionButton } from "./row-action-button";
import { RowActions } from "./row-actions";
import {
  updateMembershipStatus,
  deleteMembership,
} from "@/app/admin/(dashboard)/registros/membership-actions";
import { MEMBERSHIP_STATUS, PAYMENT_STATUS } from "@/types";
import { MemberFormDialog, type MemberFormData } from "./member-form-dialog";

type Props = {
  membership: MemberFormData & { status: string };
};

export function MembershipActions({ membership }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const isCancelled = membership.status === MEMBERSHIP_STATUS.CANCELLED;
  const hasPaymentInFlight =
    membership.paymentStatus === PAYMENT_STATUS.PENDING;

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
    <RowActions>
      <RowActionButton onClick={() => setIsEditOpen(true)} aria-label="Editar">
        <Pencil />
      </RowActionButton>
      <RowActionButton
        onClick={handleToggleStatus}
        disabled={isPending}
        aria-label={isCancelled ? "Activar" : "Cancelar"}
      >
        <Power />
      </RowActionButton>
      <DeleteRowAction
        name={`${membership.firstName} ${membership.lastName}`}
        onConfirm={handleDelete}
        isPending={isPending}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        notice={
          <>
            {/* Deleting does not stop the checkout the member may still have
                open, and Stripe will confirm it against a record that is
                gone. */}
            {hasPaymentInFlight && (
              <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Este registro tiene un pago pendiente. Si el socio lo completa
                después de borrarlo, el cobro llegará sin alta a la que
                imputarlo y habrá que devolverlo desde Stripe.
              </p>
            )}
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}
          </>
        }
      >
        Esta acción eliminará permanentemente la membresía y todos sus datos
        asociados.
      </DeleteRowAction>
      <MemberFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        membership={membership}
      />
    </RowActions>
  );
}
