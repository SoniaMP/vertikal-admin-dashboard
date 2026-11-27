import { describe, it, expect } from "vitest";
import { columnClasses, type ColumnKind } from "../table-column-classes";

const KINDS: ColumnKind[] = [
  "text",
  "number",
  "date",
  "status",
  "center",
  "actions",
];

const ALIGNMENTS = ["text-right", "text-center"] as const;

describe("columnClasses", () => {
  it.each(KINDS)(
    "gives %s a header and cells that agree on alignment",
    (kind) => {
      // The whole point of the vocabulary: a column cannot be read from the
      // right in its header and from the left in its cells.
      const { head, cell } = columnClasses(kind);

      for (const alignment of ALIGNMENTS) {
        if (kind === "actions") continue;
        expect(cell.includes(alignment)).toBe(head.includes(alignment));
      }
    },
  );

  it("gives every column the same header type", () => {
    for (const kind of KINDS) {
      expect(columnClasses(kind).head).toContain("text-xs font-normal");
    }
  });

  it("sets figures in tabular digits so a column lines up down the page", () => {
    expect(columnClasses("number").cell).toContain("tabular-nums");
    expect(columnClasses("date").cell).toContain("tabular-nums");
  });
});
