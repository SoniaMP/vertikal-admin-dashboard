"use client";

import { SummarySection } from "./summary-section";
import { SummaryRow } from "./summary-row";
import type { LicenseCatalogType } from "@/types";
import type { RegistrationInput } from "@/validations/registration";

type SummaryLicenseSectionProps = {
  data: RegistrationInput;
  licenseTypes: LicenseCatalogType[];
  onEdit: () => void;
};

export function SummaryLicenseSection({
  data,
  licenseTypes,
  onEdit,
}: SummaryLicenseSectionProps) {
  if (!data.hasClubLicense) {
    return (
      <SummarySection title="Licencia federativa" onEdit={onEdit}>
        <SummaryRow
          label="Federación y tipo"
          value={data.externalLicenseLabel}
        />
        <SummaryRow
          label="Documento"
          value={data.externalLicenseFileUrl ? "PDF subido" : "Sin subir"}
        />
      </SummarySection>
    );
  }

  const licenseType = licenseTypes.find((lt) => lt.id === data.typeId);
  const subtype = licenseType?.subtypes.find((st) => st.id === data.subtypeId);
  const category = licenseType?.categories.find(
    (c) => c.id === data.categoryId,
  );
  const supplements =
    licenseType?.supplements.filter((s) =>
      data.supplementIds?.includes(s.id),
    ) ?? [];

  return (
    <SummarySection title="Licencia y suplementos" onEdit={onEdit}>
      <SummaryRow label="Tipo" value={licenseType?.name ?? ""} />
      {subtype && <SummaryRow label="Modalidad" value={subtype.name} />}
      {category && <SummaryRow label="Categoría" value={category.name} />}
      {supplements.length > 0 && (
        <SummaryRow
          label="Suplementos"
          value={supplements.map((s) => s.name).join(", ")}
        />
      )}
    </SummarySection>
  );
}
