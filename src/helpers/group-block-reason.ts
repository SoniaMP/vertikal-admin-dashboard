import {
  supplementBlockReason,
  type SupplementBlocker,
  type SellabilityLookups,
} from "@/helpers/supplement-block-reason";

type SellableGroup = {
  id: string;
  active: boolean;
};

/**
 * Why a group is not on sale, or null when it is.
 *
 * Delegates to `supplementBlockReason()` instead of restating the rule: a
 * group is judged exactly as its members are judged through it, so it is asked
 * as a member whose group is this one. That is also why the stand-in is always
 * active — a group's own retirement is the only one that can apply here.
 */
export function groupBlockReason(
  group: SellableGroup,
  lookups: SellabilityLookups,
): SupplementBlocker | null {
  return supplementBlockReason(
    { id: group.id, active: true, supplementGroup: group },
    lookups,
  );
}
