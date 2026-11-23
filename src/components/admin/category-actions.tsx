"use client";

import { useState, useTransition } from "react";
import type { Category } from "@prisma/client";
import { Pencil, Power, Trash2 } from "lucide-react";
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
import {
  toggleCategoryActive,
  deleteCategory,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { PropagationPrompt } from "./propagation-prompt";
import type { PropagationRequest } from "@/types/catalog-propagation";
import { CategoryFormDialog } from "./category-form-dialog";

type Props = {
  category: Category;
  membershipCount: number;
};

export function CategoryActions({ category, membershipCount }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [propagation, setPropagation] = useState<PropagationRequest | null>(
    null,
  );

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleCategoryActive(category.id, !category.active);
      // Retiring something in one year says nothing about the others, so the
      // change stops here unless the admin says otherwise.
      if (result.success) {
        setPropagation({ model: "category", id: category.id, scope: "state" });
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCategory(category.id);
    });
  }

  const hasMemberships = membershipCount > 0;

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost-info"
        size="icon"
        onClick={() => setIsEditOpen(true)}
        aria-label="Editar categoría"
        className="h-7 w-7"
      >
        <Pencil className="h-3 w-3" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={category.active ? "Desactivar" : "Activar"}
        className="h-7 w-7"
      >
        <Power className="h-3 w-3" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost-destructive"
            size="icon"
            disabled={isPending || hasMemberships}
            aria-label="Eliminar categoría"
            title={
              hasMemberships
                ? "No se puede eliminar: tiene registros asociados"
                : "Eliminar"
            }
            className="h-7 w-7"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar &ldquo;{category.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la categoría y sus precios
              asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CategoryFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        category={category}
        seasonId={category.seasonId}
      />
      <PropagationPrompt
        request={propagation}
        entityLabel="esta categoría"
        onDone={() => setPropagation(null)}
      />
    </div>
  );
}
