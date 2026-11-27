"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
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
import { RowActionButton } from "./row-action-button";

type Props = {
  /** What would go, named in the question and in the button's label. */
  name: string;
  /** What deleting does, and what to do instead when there is something. */
  children: ReactNode;
  /** A warning or an error, set apart from the sentence above it. */
  notice?: ReactNode;
  onConfirm: () => void;
  disabled?: boolean;
  /** Why the bin is off, read on hover; without it the reason is invisible. */
  reason?: string;
  /** Keeps the question open while the server answers. */
  isPending?: boolean;
  /** Pass both to keep the question open after a refusal and show why. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * The bin, and the question it has to ask first.
 *
 * Deleting is the one action in a row that cannot be undone, so it is the one
 * that must not look or behave differently depending on which list you are in.
 * The question, the wording of the two buttons and the red on the one that
 * destroys something all live here; the caller supplies only what goes and
 * what happens to it.
 *
 * The row's own label names the record — "Eliminar Tarjeta impresa" — because
 * a column of buttons that all announce themselves as "Eliminar" tells someone
 * reading with a screen reader nothing about which row they are on.
 */
export function DeleteRowAction({
  name,
  children,
  notice,
  onConfirm,
  disabled,
  reason,
  isPending,
  open,
  onOpenChange,
}: Props) {
  const [isSelfOpen, setIsSelfOpen] = useState(false);
  const isDriven = open !== undefined;

  return (
    <AlertDialog
      open={isDriven ? open : isSelfOpen}
      onOpenChange={isDriven ? onOpenChange : setIsSelfOpen}
    >
      <AlertDialogTrigger asChild>
        <RowActionButton
          disabled={disabled || isPending}
          aria-label={`Eliminar ${name}`}
          title={reason ?? "Eliminar"}
        >
          <Trash2 />
        </RowActionButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar «{name}»?</AlertDialogTitle>
          <AlertDialogDescription>{children}</AlertDialogDescription>
        </AlertDialogHeader>
        {notice}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              // A caller that drives the dialog does so because the delete can
              // come back refused, and the reason has to be readable where the
              // question was asked.
              if (isDriven) event.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
