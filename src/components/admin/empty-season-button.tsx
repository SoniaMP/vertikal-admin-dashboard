"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
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
import { emptySeasonCatalog } from "@/app/admin/(dashboard)/tipos-federacion/actions/empty-season-catalog";

type Props = {
  year: number;
  /** The year registrations land in today: emptying it stops club licences. */
  isActiveYear: boolean;
};

/**
 * Wipes a year's catalog so it can be built again from nothing. Offered only
 * on open years with prices and no memberships; the server re-checks all of it.
 */
export function EmptySeasonButton({ year, isActiveYear }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEmpty(event: React.MouseEvent) {
    // Keep the dialog open until the server answers, so a refusal is readable.
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await emptySeasonCatalog(year);
      if (result.success) {
        setIsOpen(false);
        return;
      }
      setError(result.error ?? "No se pudo vaciar la temporada.");
    });
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
          Vaciar {year}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Vaciar {year}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán todas las federativas, modalidades, categorías,
            suplementos y precios de {year}. No se puede deshacer.
            {isActiveYear &&
              ` Mientras esté vacía, nadie podrá federarse con el club.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleEmpty}
            disabled={isPending}
          >
            {isPending ? "Vaciando…" : `Vaciar ${year}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
