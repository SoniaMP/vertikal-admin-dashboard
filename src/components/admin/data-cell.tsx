import type { ComponentProps } from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { columnClasses, type ColumnKind } from "@/helpers/table-column-classes";

type Props = ComponentProps<typeof TableCell> & {
  /** The same kind its header was given, or the two stop agreeing. */
  kind?: ColumnKind;
};

export function DataCell({ kind = "text", className, ...props }: Props) {
  return (
    <TableCell className={cn(columnClasses(kind).cell, className)} {...props} />
  );
}
