import { FederationChip } from "./federation-chip";
import type { GroupBlocker } from "@/helpers/group-block-reason";
import type { OfferedType } from "@/helpers/offered-license-types";

const BLOCKER_TEXT: Record<GroupBlocker, string> = {
  retired: "retirado",
  "no-members": "sin suplementos",
  unpriced: "sin precio",
  "no-federations": "sin federativas",
};

type Props = {
  /** A supplement's reason or a group's; a group has one more. */
  blocker: GroupBlocker | null;
  offeredTypes: OfferedType[];
};

/**
 * Says where an extra shows up, and why it does not when it does not.
 *
 * Three different things keep an extra off the wizard — retired, unpriced,
 * unassigned — and from the member's side all three look the same: it is not
 * there. Naming the one that applies is what stops the question coming back
 * every season.
 */
export function SupplementOfferLine({ blocker, offeredTypes }: Props) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <span>
        {blocker === null
          ? "Se ofrece en"
          : `No se vende · ${BLOCKER_TEXT[blocker]}`}
      </span>
      {offeredTypes.map((type) => (
        <FederationChip
          key={type.id}
          name={type.name}
          isRetired={type.isRetired}
        />
      ))}
    </div>
  );
}
