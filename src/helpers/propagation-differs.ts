import type { CatalogRow } from "@/lib/catalog-row";
import type { PropagationScope } from "@/types/catalog-propagation";

/**
 * Whether carrying this edit to that season would actually change it.
 *
 * The panel asks about propagating only when the answer is yes, because a
 * question whose "sí" does nothing is pure noise: the admin stops reading it,
 * and the one time it matters they click through it out of habit. It reaches
 * them most often through a form they opened for something else entirely —
 * ticking a federation on a group, say, whose name already matches next year.
 *
 * The fields compared are the ones propagation writes, so the two can never
 * disagree: `texts` writes name and description together, and a group has no
 * description, which `readCatalogRow()` reports as an empty string on both
 * sides so it compares equal.
 */
export function propagationDiffers(
  source: CatalogRow,
  sibling: CatalogRow,
  scope: PropagationScope,
): boolean {
  if (scope === "state") return sibling.active !== source.active;

  return (
    sibling.name !== source.name || sibling.description !== source.description
  );
}
