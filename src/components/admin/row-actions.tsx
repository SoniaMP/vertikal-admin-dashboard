import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * The actions at the end of a row, spaced the same way in every list.
 *
 * It owns the gap between the buttons and the air before them, so the column
 * they sit in never ends up touching the last piece of data. Both used to be
 * written by hand per table, which is how one list ended up at gap-0.5 and the
 * rest at gap-1.
 */
export function RowActions({ children }: Props) {
  return (
    <div className="flex items-center justify-end gap-1 pl-6">{children}</div>
  );
}
