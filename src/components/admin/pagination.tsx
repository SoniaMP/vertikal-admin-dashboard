"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  basePath?: string;
  itemLabel?: ItemLabel;
};

/** Singular and plural, because "de 1 miembros" is what you get otherwise. */
type ItemLabel = { one: string; many: string };

const MEMBER_LABEL: ItemLabel = { one: "miembro", many: "miembros" };

export function Pagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  basePath = "/admin",
  itemLabel = MEMBER_LABEL,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1 && total === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between mt-4">
      <span className="text-sm text-muted-foreground">
        Mostrando {from}-{to} de {total}{" "}
        {total === 1 ? itemLabel.one : itemLabel.many}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </nav>
  );
}
