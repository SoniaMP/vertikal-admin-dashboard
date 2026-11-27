"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./status-pill";
import { CategoryActions } from "./category-actions";
import { CategoryFormDialog } from "./category-form-dialog";

type CategoryWithCount = Category & {
  _count: { memberships: number };
};

type Props = {
  categories: CategoryWithCount[];
  seasonId: string;
};

export function CategoriesSection({ categories, seasonId }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="rounded-lg border px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Categorías ({categories.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin categorías todavía.
            </p>
          )}
          {categories.map((cat) => (
            <CategoryRow key={cat.id} category={cat} />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Añadir categoría
          </Button>
          <CategoryFormDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            seasonId={seasonId}
          />
        </div>
      )}
    </div>
  );
}

function CategoryRow({ category }: { category: CategoryWithCount }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-medium truncate">{category.name}</span>
        <StatusPill tone={category.active ? "positive" : "neutral"}>
          {category.active ? "Activo" : "Inactivo"}
        </StatusPill>
      </div>
      <CategoryActions
        category={category}
        membershipCount={category._count.memberships}
      />
    </div>
  );
}
