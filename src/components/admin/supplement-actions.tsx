"use client";

import { useState, useTransition } from "react";
import type { Supplement, SupplementGroup } from "@prisma/client";
import { Pencil, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSupplementActive } from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { PropagationPrompt } from "./propagation-prompt";
import type { PropagationRequest } from "@/types/catalog-propagation";
import { SupplementFormDialog } from "./supplement-form-dialog";
import type { SelectableLicenseType } from "./license-type-checklist";

type SupplementGroupWithSupplements = SupplementGroup & {
  supplements: Supplement[];
};

type Props = {
  supplement: Supplement;
  supplementGroups: SupplementGroupWithSupplements[];
  licenseTypes: SelectableLicenseType[];
  selectedTypeIds: string[];
};

export function SupplementActions({
  supplement,
  supplementGroups,
  licenseTypes,
  selectedTypeIds,
}: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [propagation, setPropagation] = useState<PropagationRequest | null>(
    null,
  );

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleSupplementActive(supplement.id, !supplement.active);
      // Retiring something in one year says nothing about the others, so the
      // change stops here unless the admin says otherwise.
      if (result.success) {
        setPropagation({ model: "supplement", id: supplement.id, scope: "state" });
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost-info"
        size="icon"
        onClick={() => setIsEditOpen(true)}
        aria-label="Editar suplemento"
        className="h-7 w-7"
      >
        <Pencil className="h-3 w-3" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={supplement.active ? "Desactivar" : "Activar"}
        className="h-7 w-7"
      >
        <Power className="h-3 w-3" />
      </Button>
      <SupplementFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        seasonId={supplement.seasonId}
        supplement={supplement}
        supplementGroups={supplementGroups}
        licenseTypes={licenseTypes}
        selectedTypeIds={selectedTypeIds}
      />
      <PropagationPrompt
        request={propagation}
        entityLabel="este suplemento"
        onDone={() => setPropagation(null)}
      />
    </div>
  );
}
