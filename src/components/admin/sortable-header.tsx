"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataHead } from "./data-head";
import type { ColumnKind } from "@/helpers/table-column-classes";

type Props = {
  field: string;
  label: string;
  currentSort: string;
  currentDir: "asc" | "desc";
  basePath?: string;
  /** What the column holds, exactly as its cells are told. */
  kind?: ColumnKind;
  /** Width or responsive classes only; the kind decides the alignment. */
  className?: string;
};

export function SortableHeader({
  field,
  label,
  currentSort,
  currentDir,
  basePath = "/admin",
  kind = "text",
  className,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isActive = currentSort === field;

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    if (isActive) {
      params.set("sortDir", currentDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortDir", "asc");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  const Icon = isActive
    ? currentDir === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  const ariaSort = isActive
    ? currentDir === "asc"
      ? "ascending"
      : "descending"
    : "none";

  const readsFromTheRight = kind === "number" || kind === "date";

  return (
    <DataHead
      kind={kind}
      className={className}
      aria-sort={ariaSort as "ascending" | "descending" | "none"}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Ordenar por ${label}`}
        className={cn(
          "flex items-center gap-1 transition-colors hover:text-foreground",
          // In a column that reads from the right, the arrow goes on the
          // inside: trailing it would hold the right edge and leave the label
          // permanently short of the figures underneath.
          readsFromTheRight && "ml-auto flex-row-reverse",
          kind === "center" && "mx-auto",
        )}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </DataHead>
  );
}
