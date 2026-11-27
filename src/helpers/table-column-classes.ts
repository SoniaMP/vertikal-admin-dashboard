/** What a column holds, which is what decides how it is read. */
export type ColumnKind =
  | "text"
  | "number"
  | "date"
  | "status"
  | "center"
  | "actions";

export type ColumnClasses = {
  head: string;
  cell: string;
};

/** 12px grey, no fill band: the same header in every table of the panel. */
const HEAD = "h-9 px-2 align-middle text-xs font-normal text-muted-foreground";

const BY_KIND: Record<ColumnKind, ColumnClasses> = {
  text: { head: "", cell: "" },
  // Figures are read down the column, so they hang off the right edge and
  // share a width per digit; a date is a figure in this respect.
  number: { head: "text-right", cell: "text-right tabular-nums" },
  date: { head: "text-right", cell: "text-right tabular-nums" },
  // A pill is its own block: its edge lines up with the label, not its text.
  status: { head: "", cell: "" },
  center: { head: "text-center", cell: "text-center" },
  // The buttons set the width; RowActions inside holds the air before them.
  actions: { head: "w-px text-right", cell: "w-px" },
};

/**
 * How a column's header and its cells are written, from one place.
 *
 * Alignment used to be declared twice — once in the header's class and again
 * in the cell's — with nothing holding the two together, which is how a
 * column ended up with its title against the right edge and its dates against
 * the left. Here a column says what it holds, once, and both halves follow.
 *
 * Widths are not here on purpose: how wide a column should be depends on what
 * that particular table puts in it, while how it is read does not.
 */
export function columnClasses(kind: ColumnKind): ColumnClasses {
  const kindClasses = BY_KIND[kind];

  return {
    head: `${HEAD} ${kindClasses.head}`.trim(),
    cell: kindClasses.cell,
  };
}
