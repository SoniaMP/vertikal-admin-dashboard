"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, type ActionResult } from "@/lib/actions";
import {
  findOpenLineageSiblings,
  type LineageSibling,
} from "@/lib/catalog-lineage";
import { propagateCatalogEdit } from "@/lib/catalog-propagation";
import { readCatalogRow, type CatalogRow } from "@/lib/catalog-row";
import { propagationDiffers } from "@/helpers/propagation-differs";
import { prisma } from "@/lib/prisma";
import type {
  CatalogModelName,
  PropagationScope,
  PropagationTargets,
} from "@/types/catalog-propagation";

const CATALOG_MODELS: CatalogModelName[] = [
  "licenseType",
  "licenseSubtype",
  "category",
  "supplement",
  "supplementGroup",
];

const SCOPES: PropagationScope[] = ["texts", "state"];

const NOTHING_TO_ASK: PropagationTargets = {
  name: "",
  active: false,
  sourceYear: 0,
  years: [],
};

/**
 * The other open seasons this edit would actually change, as years.
 *
 * Called right after a save so the panel can ask whether the change should
 * also apply there. An empty list means there is nothing to ask: the entity
 * only exists in the year on screen, the rest are closed years that are never
 * offered, or — most often — those years already say the same thing, so
 * carrying the edit over would write nothing.
 *
 * That last case is why the scope is a parameter. An admin opens the edit form
 * to tick a federation and saves without touching the name; asking them about
 * a name that already matches next year trains them to dismiss the question
 * unread, which is the one way it can do harm.
 */
export async function findPropagationTargets(
  model: string,
  id: string,
  scope: string,
): Promise<PropagationTargets> {
  if (!isCatalogModel(model) || !isScope(scope)) return NOTHING_TO_ASK;

  const authError = await requireAuth();
  if (authError) return NOTHING_TO_ASK;

  const row = await readCatalogRow(model, id);
  if (!row) return NOTHING_TO_ASK;

  const [season, siblings] = await Promise.all([
    prisma.season.findUnique({
      where: { id: row.seasonId },
      select: { year: true },
    }),
    findOpenLineageSiblings(model, id),
  ]);

  if (!season) return NOTHING_TO_ASK;

  return {
    name: row.name,
    active: row.active,
    sourceYear: season.year,
    years: await selectDifferingYears(model, row, siblings, scope),
  };
}

/** The sibling years where saying yes would write something new. */
async function selectDifferingYears(
  model: CatalogModelName,
  source: CatalogRow,
  siblings: LineageSibling[],
  scope: PropagationScope,
): Promise<number[]> {
  const pairs = await Promise.all(
    siblings.map(async (sibling) => ({
      year: sibling.year,
      row: await readCatalogRow(model, sibling.id),
    })),
  );

  return pairs
    .filter(({ row }) => row !== null && propagationDiffers(source, row, scope))
    .map(({ year }) => year);
}

/** Carries the edit just saved onto the same entity in the other open seasons. */
export async function propagateCatalogChange(
  model: string,
  id: string,
  scope: string,
): Promise<ActionResult> {
  const authError = await requireAuth();
  if (authError) return authError;

  if (!isCatalogModel(model) || !isScope(scope)) {
    return { success: false, error: "Datos inválidos." };
  }

  const updated = await propagateCatalogEdit(model, id, scope);

  if (updated === 0) {
    return {
      success: false,
      error: "No se ha podido aplicar a las demás temporadas.",
    };
  }

  revalidatePath("/admin/tipos-federacion");
  return { success: true };
}

function isCatalogModel(value: string): value is CatalogModelName {
  return (CATALOG_MODELS as string[]).includes(value);
}

function isScope(value: string): value is PropagationScope {
  return (SCOPES as string[]).includes(value);
}
