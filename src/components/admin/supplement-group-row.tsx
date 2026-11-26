"use client";

import { useState, useTransition } from "react";
import type {
  Supplement,
  SupplementGroup,
  SupplementGroupPrice,
} from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteSupplementGroup,
  upsertSupplementGroupPrice,
} from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { buildAdminSellabilityLookups } from "@/helpers/admin-sellability-lookups";
import { groupBlockReason } from "@/helpers/group-block-reason";
import { selectOfferedTypes } from "@/helpers/offered-license-types";
import { GroupMemberList } from "./group-member-list";
import { SupplementGroupFormDialog } from "./supplement-group-form-dialog";
import { SupplementOfferLine } from "./supplement-offer-line";
import type { SelectableLicenseType } from "./license-type-checklist";

type SupplementGroupWithPrices = SupplementGroup & {
  supplements: Supplement[];
  groupPrices: SupplementGroupPrice[];
  typeLinks: { typeId: string }[];
};

type Props = {
  group: SupplementGroupWithPrices;
  supplementGroups: SupplementGroupWithPrices[];
  licenseTypes: SelectableLicenseType[];
  seasonId: string;
};

/**
 * One group with the supplements it sells inside it.
 *
 * The members are nested because the group owns their price and their
 * federations both: seeing them in here is what stops an admin looking for
 * those controls on a member, where they do not exist. The price field and the
 * "se ofrece en" line appear once, on the group, which is the only row that
 * can change them.
 */
export function SupplementGroupRow({
  group,
  supplementGroups,
  licenseTypes,
  seasonId,
}: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const seasonPrice = group.groupPrices[0]?.price;

  function handleDelete() {
    startTransition(async () => {
      await deleteSupplementGroup(group.id);
    });
  }

  function handlePriceSave(value: string) {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) return;

    startTransition(async () => {
      await upsertSupplementGroupPrice(
        group.id,
        seasonId,
        Math.round(amount * 100),
      );
    });
  }

  return (
    <div className="rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-medium">{group.name}</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            defaultValue={seasonPrice ? (seasonPrice / 100).toFixed(2) : ""}
            placeholder="€"
            className="h-7 w-20 text-center text-xs"
            disabled={isPending}
            onBlur={(event) => handlePriceSave(event.target.value)}
          />
          <Badge variant={group.active ? "default" : "secondary"}>
            {group.active ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost-info"
            size="icon"
            onClick={() => setIsEditOpen(true)}
            aria-label="Editar grupo"
            className="h-7 w-7"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost-destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Eliminar grupo"
            className="h-7 w-7"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <SupplementOfferLine
        blocker={groupBlockReason(group, buildAdminSellabilityLookups([], [group]))}
        offeredTypes={selectOfferedTypes(
          group.typeLinks.map((link) => link.typeId),
          licenseTypes,
        )}
      />

      <GroupMemberList
        groupId={group.id}
        supplements={group.supplements}
        supplementGroups={supplementGroups}
        licenseTypes={licenseTypes}
        seasonId={seasonId}
      />

      <SupplementGroupFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        seasonId={group.seasonId}
        group={group}
        licenseTypes={licenseTypes}
        selectedTypeIds={group.typeLinks.map((link) => link.typeId)}
      />
    </div>
  );
}
