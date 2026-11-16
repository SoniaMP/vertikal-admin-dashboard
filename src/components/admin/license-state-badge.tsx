import { resolveLicenseVisibility } from "@/helpers/license-visibility";
import { StatusPill, type PillTone } from "./status-pill";

const PILL_BY_VISIBILITY: Record<string, { label: string; tone: PillTone }> = {
  draft: { label: "Borrador", tone: "warning" },
  published: { label: "Activo", tone: "positive" },
  retired: { label: "Inactivo", tone: "neutral" },
};

type Props = {
  license: { active: boolean; publishedAt: Date | null };
};

export function LicenseStateBadge({ license }: Props) {
  const { label, tone } = PILL_BY_VISIBILITY[resolveLicenseVisibility(license)];

  return <StatusPill tone={tone}>{label}</StatusPill>;
}
