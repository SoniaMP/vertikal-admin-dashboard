"use client";

import { useState, useTransition } from "react";
import { Eye, Pencil, Power } from "lucide-react";
import { RowActionButton } from "./row-action-button";
import { RowActions } from "./row-actions";
import { toggleLicenseTypeActive } from "@/app/admin/(dashboard)/tipos-federacion/actions";
import { DeleteLicenseTypeButton } from "./delete-license-type-button";
import { LicenseTypeFormDialog } from "./license-type-form-dialog";
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
  const isDraft = resolveLicenseVisibility(licenseType) === "draft";

  function handleToggle() {
    startTransition(async () => {
      await toggleLicenseTypeActive(licenseType.id, !licenseType.active);
      // Retiring a federation in one year says nothing about the others, so
      // the change stops here unless the admin says otherwise.
    });
  }

  return (
    <RowActions>
      <RowActionButton
        onClick={() => setIsPreviewOpen(true)}
        aria-label={isDraft ? "Previsualizar y publicar" : "Previsualizar"}
      >
        <Eye />
      </RowActionButton>
      <RowActionButton onClick={() => setIsEditOpen(true)} aria-label="Editar">
        <Pencil />
      </RowActionButton>
      {/* Activating a draft changes nothing a member can see, so the toggle
          only shows up once the type has been published. */}
      {!isDraft && (
        <RowActionButton
          onClick={handleToggle}
          disabled={isPending}
          aria-label={licenseType.active ? "Desactivar" : "Activar"}
        >
          <Power />
        </RowActionButton>
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
    </RowActions>
  );
}
