import type { ActionResult } from "@/lib/actions";
import { readCatalogRow } from "@/lib/catalog-row";
import type { CatalogModelName } from "@/types/catalog-propagation";
import { requireEditableSeason } from "@/lib/season-editable";

/**
 * Refuses a write aimed at a catalog row that belongs to a closed season.
 *
 * The row itself says which year it is from, so an edit cannot be aimed at a
 * closed year by passing an id from one. The panel already renders those
 * years as a read-only report, but hiding the controls is not the same as
 * refusing the write.
 */
export async function requireEditableCatalogRow(
  model: CatalogModelName,
  id: string,
): Promise<ActionResult | null> {
  const row = await readCatalogRow(model, id);

  if (!row) {
    return { success: false, error: "El elemento ya no existe." };
  }

  return requireEditableSeason(row.seasonId);
}
