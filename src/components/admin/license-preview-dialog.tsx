"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildLicenseTypePreview } from "@/helpers/license-preview";
import { LicensePreviewContent } from "./license-preview-content";
import { LicensePublishFooter } from "./license-publish-footer";
import type {
  LicenseTypeWithRelations,
  CategoryWithCount,
} from "./license-types-table";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenseType: LicenseTypeWithRelations;
  categories: CategoryWithCount[];
  seasonName: string;
};

export function LicensePreviewDialog({
  open,
  onOpenChange,
  licenseType,
  categories,
  seasonName,
}: Props) {
  const preview = buildLicenseTypePreview(
    licenseType,
    categories.filter((category) => category.active),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista previa: {licenseType.name}</DialogTitle>
        </DialogHeader>
        <LicensePreviewContent preview={preview} seasonName={seasonName} />
        {preview.visibility === "draft" && (
          <LicensePublishFooter
            licenseTypeId={licenseType.id}
            canPublish={preview.readiness.canPublish}
            onPublished={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
