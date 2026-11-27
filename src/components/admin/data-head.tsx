import type { ComponentProps } from "react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { columnClasses, type ColumnKind } from "@/helpers/table-column-classes";

type Props = ComponentProps<typeof TableHead> & {
  /** What the column holds; it decides the alignment on both halves. */
  kind?: ColumnKind;
};

/**
 * A column header, written the same way in every table.
 *
 * `className` is still open because widths belong to the table that knows
 * what it is showing. Alignment does not: that comes from the kind, so a
 * header cannot drift away from the cells underneath it.
 */
export function DataHead({ kind = "text", className, ...props }: Props) {
  return (
    <TableHead className={cn(columnClasses(kind).head, className)} {...props} />
  );
}
