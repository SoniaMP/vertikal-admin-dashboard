import {
  supplementBlockReason,
  type SupplementBlocker,
  type SellabilityLookups,
} from "@/helpers/supplement-block-reason";

/** A group can fail for its members' reasons, plus one of its own. */
export type GroupBlocker = SupplementBlocker | "no-members";

type SellableGroup = {
  id: string;
  active: boolean;
  /** The group's own supplements, whatever their state. */
  supplements: { active: boolean }[];
};

/**
 * Why a group is not on sale, or null when it is.
 *
 * Delegates to `supplementBlockReason()` instead of restating the rule: a
 * group is judged exactly as its members are judged through it, so it is asked
 * as a member whose group is this one. That is also why the stand-in is always
 * active — a group's own retirement is the only one that can apply here.
 *
 * Emptiness is the one reason a group has that a supplement cannot have, and
 * it is checked here rather than in the shared predicate: a member's group is
 * never empty, it has that member in it. The wizard builds a federation's
 * groups from the supplements that landed there, so a group with nobody in it
 * reaches no one however well it is priced and linked. Saying it out loud is
 * the point — otherwise the panel shows a price, a federation and a sale that
 * is not happening.
 */
export function groupBlockReason(
  group: SellableGroup,
  lookups: SellabilityLookups,
): GroupBlocker | null {
  if (!group.active) return "retired";
  if (!group.supplements.some((supplement) => supplement.active)) {
    return "no-members";
  }

  return supplementBlockReason(
    { id: group.id, active: true, supplementGroup: group },
    lookups,
  );
}
