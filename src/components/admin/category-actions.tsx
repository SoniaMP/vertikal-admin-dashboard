"use client";

import { useState, useTransition } from "react";
import type { Category } from "@prisma/client";
import { Pencil, Power } from "lucide-react";
import { DeleteRowAction } from "./delete-row-action";
import { RowActionButton } from "./row-action-button";
import { RowActions } from "./row-actions";
import {
  toggleCategoryActive,
  deleteCategory,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { CategoryFormDialog } from "./category-form-dialog";

type Props = {
  category: Category;
  membershipCount: number;
};

export function CategoryActions({ category, membershipCount }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleCategoryActive(category.id, !category.active);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCategory(category.id);
    });
  }

  const hasMemberships = membershipCount > 0;

  return (
    <RowActions>
      <RowActionButton
        onClick={() => setIsEditOpen(true)}
        aria-label="Editar categoría"
      >
        <Pencil />
      </RowActionButton>
      <RowActionButton
        onClick={handleToggle}
        disabled={isPending}
        aria-label={category.active ? "Desactivar" : "Activar"}
      >
        <Power />
      </RowActionButton>
      <DeleteRowAction
        name={category.name}
        onConfirm={handleDelete}
        disabled={isPending || hasMemberships}
        reason={
          hasMemberships
            ? "No se puede eliminar: tiene registros asociados"
            : undefined
        }
      >
        Esta acción eliminará permanentemente la categoría y sus precios
        asociados.
      </DeleteRowAction>
      <CategoryFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        category={category}
        seasonId={category.seasonId}
      />
    </RowActions>
  );
}
