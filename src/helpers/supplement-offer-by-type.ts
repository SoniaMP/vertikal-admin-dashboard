import {
  supplementBlockReason,
  type SellabilityLookups,
} from "@/helpers/supplement-block-reason";
import type { SupplementSummary, SupplementGroupSummary } from "@/types";

type SupplementRow = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  supplementGroupId: string | null;
  supplementGroup: { id: string; name: string; active: boolean } | null;
};

/** Which federations offer each supplement and each group, by their own id. */
export type OfferLinks = {
  typeIdsBySupplementId: Map<string, string[]>;
  typeIdsByGroupId: Map<string, string[]>;
};

export type SupplementOfferByType = {
  supplementsByTypeId: Map<string, SupplementSummary[]>;
  groupsByTypeId: Map<string, SupplementGroupSummary[]>;
};

function toSummary(
  row: SupplementRow,
  lookups: SellabilityLookups,
): SupplementSummary {
  const group = row.supplementGroup;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: lookups.priceBySupplementId.get(row.id) ?? null,
    active: row.active,
    supplementGroupId: row.supplementGroupId,
    supplementGroup: group
      ? {
          id: group.id,
          name: group.name,
          price: lookups.priceByGroupId.get(group.id) ?? 0,
        }
      : null,
  };
}

function append<T>(index: Map<string, T[]>, key: string, value: T): void {
  const current = index.get(key) ?? [];
  current.push(value);
  index.set(key, current);
}

function appendGroupOnce(
  index: Map<string, SupplementGroupSummary[]>,
  typeId: string,
  group: SupplementGroupSummary,
): void {
  const current = index.get(typeId) ?? [];
  if (current.some((entry) => entry.id === group.id)) return;
  current.push(group);
  index.set(typeId, current);
}

/**
 * Buckets a season's extras into what each federation offers.
 *
 * A supplement reaches a federation through its own links when it is
 * standalone, and through its group's when it belongs to one — the same rule
 * that decides its price. An extra that is not sellable reaches none of them,
 * whatever its links say.
 *
 * Each federation's groups are derived from the supplements that landed in it,
 * so a group never shows up with nothing to pick inside it.
 */
export function buildSupplementOfferByType(
  supplements: SupplementRow[],
  lookups: SellabilityLookups,
  links: OfferLinks,
): SupplementOfferByType {
  const supplementsByTypeId = new Map<string, SupplementSummary[]>();
  const groupsByTypeId = new Map<string, SupplementGroupSummary[]>();

  for (const row of supplements) {
    if (supplementBlockReason(row, lookups) !== null) continue;

    const summary = toSummary(row, lookups);
    const offeredIn = row.supplementGroup
      ? links.typeIdsByGroupId.get(row.supplementGroup.id)
      : links.typeIdsBySupplementId.get(row.id);

    for (const typeId of offeredIn ?? []) {
      append(supplementsByTypeId, typeId, summary);
      if (summary.supplementGroup) {
        appendGroupOnce(groupsByTypeId, typeId, summary.supplementGroup);
      }
    }
  }

  return { supplementsByTypeId, groupsByTypeId };
}
