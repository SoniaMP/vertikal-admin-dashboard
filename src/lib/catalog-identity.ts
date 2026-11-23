import { randomUUID } from "node:crypto";

/**
 * Identity for a catalog row that nobody copied from anywhere.
 *
 * It starts its own lineage, so id and lineage are the same value. Rows cloned
 * into later seasons get a fresh id but carry this lineage forward, which is
 * what lets a federation be followed across years after a rename or a reprice.
 */
export function newCatalogIdentity(): { id: string; lineageId: string } {
  const id = randomUUID();
  return { id, lineageId: id };
}
