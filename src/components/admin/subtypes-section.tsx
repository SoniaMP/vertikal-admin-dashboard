"use client";

import { useState } from "react";
import type { LicenseSubtype } from "@prisma/client";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LicenseStateBadge } from "./license-state-badge";
import { SubtypePublishButton } from "./subtype-publish-button";
import { resolveLicenseVisibility } from "@/helpers/license-visibility";
import { SubtypeActions } from "./subtype-actions";
import { SubtypeFormDialog } from "./subtype-form-dialog";

type SubtypeWithCount = LicenseSubtype & {
  _count: { memberships: number };
};

type Props = {
  licenseTypeId: string;
  subtypes: SubtypeWithCount[];
  /** Season offerings of the parent type, to tell which modalities are priced. */
  offerings: { subtypeId: string }[];
};

export function SubtypesSection({
  licenseTypeId,
  subtypes,
  offerings,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const pricedSubtypeIds = new Set(offerings.map((o) => o.subtypeId));

  return (
    <div className="border-t px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Subtipos ({subtypes.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {subtypes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin subtipos todavía.
            </p>
          )}
          {subtypes.map((sub) => (
            <SubtypeRow
              key={sub.id}
              subtype={sub}
              hasPrices={pricedSubtypeIds.has(sub.id)}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="mt-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Añadir subtipo
          </Button>
          <SubtypeFormDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            licenseTypeId={licenseTypeId}
          />
        </div>
      )}
    </div>
  );
}

type SubtypeRowProps = {
  subtype: SubtypeWithCount;
  hasPrices: boolean;
};

function SubtypeRow({ subtype, hasPrices }: SubtypeRowProps) {
  const isDraft = resolveLicenseVisibility(subtype) === "draft";

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-medium truncate">{subtype.name}</span>
        <LicenseStateBadge license={subtype} />
      </div>
      <div className="flex items-center gap-2">
        {isDraft && (
          <SubtypePublishButton subtypeId={subtype.id} hasPrices={hasPrices} />
        )}
        <SubtypeActions
          subtype={subtype}
          membershipCount={subtype._count.memberships}
        />
      </div>
    </div>
  );
}
