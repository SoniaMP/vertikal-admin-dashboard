"use client";

import { useEffect, useState, useTransition } from "react";
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
import {
  findPropagationTargets,
  propagateCatalogChange,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import type {
  PropagationRequest,
  PropagationTargets,
} from "@/types/catalog-propagation";
import { describePropagation } from "@/helpers/propagation-copy";

type Props = {
  /** The edit just saved. `null` while there is nothing to ask about. */
  request: PropagationRequest | null;
  /** The row's kind with its article: "esta categoría", "este suplemento". */
  entityLabel: string;
  onDone: () => void;
};

/**
 * Asks whether an edit should also reach the other open seasons.
 *
 * The change is already saved in the year on screen before this appears: the
 * question is only ever about spreading it, never about whether to apply it.
 * Saying no is the default and leaves the other years alone, which is the
 * whole point — an admin should never discover they moved ten seasons.
 *
 * Closed seasons are not listed, because the server does not return them.
 */
export function PropagationPrompt({ request, entityLabel, onDone }: Props) {
  // Kept together with the request they answer, so a stale lookup can never
  // put last edit's question on screen.
  const [answered, setAnswered] = useState<{
    request: PropagationRequest;
    targets: PropagationTargets;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!request) return;

    let isCurrent = true;
    findPropagationTargets(request.model, request.id, request.scope).then(
      (targets) => {
        if (!isCurrent) return;
        // Nothing to ask: no other open season has it, or the ones that do
        // already say the same, so saying yes would write nothing.
        if (targets.years.length === 0) onDone();
        else setAnswered({ request, targets });
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [request, onDone]);

  const targets = answered?.request === request ? answered.targets : null;

  function handleConfirm() {
    if (!request) return;
    startTransition(async () => {
      await propagateCatalogChange(request.model, request.id, request.scope);
      onDone();
    });
  }

  if (!request || !targets) return null;

  const copy = describePropagation({
    entityLabel,
    name: targets.name,
    years: targets.years,
    scope: request.scope,
    isActive: targets.active,
  });

  return (
    <AlertDialog open onOpenChange={(open) => !open && onDone()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            Solo en {targets.sourceYear}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Aplicando..." : copy.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
