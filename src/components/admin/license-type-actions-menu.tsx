"use client";

import { useState, useTransition } from "react";
import { Eye, Pencil, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleLicenseTypeActive } from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { DeleteLicenseTypeButton } from "./delete-license-type-button";
import { LicenseTypeFormDialog } from "./license-type-form-dialog";
import { PropagationPrompt } from "./propagation-prompt";
import type { PropagationRequest } from "@/types/catalog-propagation";
import { LicensePreviewDialog } from "./license-preview-dialog";
import { resolveLicenseVisibility } from "@/helpers/license-visibility";
import type {
  LicenseTypeWithRelations,
  CategoryWithCount,
} from "./license-types-table";

type Props = {
  licenseType: LicenseTypeWithRelations;
  membershipCount: number;
  categories: CategoryWithCount[];
  seasonName: string;
};

export function LicenseTypeActions({
  licenseType,
  membershipCount,
  categories,
  seasonName,
}: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [propagation, setPropagation] = useState<PropagationRequest | null>(
    null,
  );
  const isDraft = resolveLicenseVisibility(licenseType) === "draft";

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleLicenseTypeActive(
        licenseType.id,
        !licenseType.active,
      );
      // Retiring a federation in one year says nothing about the others, so
      // the change stops here unless the admin says otherwise.
      if (result.success) {
        setPropagation({
          model: "licenseType",
          id: licenseType.id,
          scope: "state",
        });
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsPreviewOpen(true)}
        aria-label={isDraft ? "Previsualizar y publicar" : "Previsualizar"}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsEditOpen(true)}
        aria-label="Editar"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {/* Activating a draft changes nothing a member can see, so the toggle
          only shows up once the type has been published. */}
      {!isDraft && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          disabled={isPending}
          aria-label={licenseType.active ? "Desactivar" : "Activar"}
        >
          <Power className="h-4 w-4" />
        </Button>
      )}
      <DeleteLicenseTypeButton
        licenseTypeId={licenseType.id}
        name={licenseType.name}
        hasMemberships={membershipCount > 0}
      />
      <LicenseTypeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        seasonId={licenseType.seasonId}
        licenseType={licenseType}
      />
      <LicensePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        licenseType={licenseType}
        categories={categories}
        seasonName={seasonName}
      />
      <PropagationPrompt
        request={propagation}
        entityLabel="esta federativa"
        onDone={() => setPropagation(null)}
      />
    </div>
  );
}
