"use client";

import { useTransition } from "react";
import { DeleteRowAction } from "@/components/admin/delete-row-action";
import { deleteEnrollee } from "@/app/admin/(dashboard)/cursos/actions";

type Props = {
  registrationId: string;
  courseId: string;
  participantName: string;
};

export function DeleteEnrolleeButton({
  registrationId,
  courseId,
  participantName,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteEnrollee(registrationId, courseId);
    });
  }

  return (
    <DeleteRowAction
      name={participantName}
      onConfirm={handleDelete}
      isPending={isPending}
    >
      Se eliminará la inscripción de este participante. Esta acción no genera
      un reembolso automático en Stripe.
    </DeleteRowAction>
  );
}
