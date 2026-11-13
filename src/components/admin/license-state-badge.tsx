import { Badge } from "@/components/ui/badge";
import { resolveLicenseVisibility } from "@/helpers/license-visibility";

const BADGE_BY_VISIBILITY = {
  draft: { label: "Borrador", variant: "outline" as const },
  published: { label: "Activo", variant: "default" as const },
  retired: { label: "Inactivo", variant: "secondary" as const },
};

type Props = {
  license: { active: boolean; publishedAt: Date | null };
};

export function LicenseStateBadge({ license }: Props) {
  const { label, variant } = BADGE_BY_VISIBILITY[
    resolveLicenseVisibility(license)
  ];

  return <Badge variant={variant}>{label}</Badge>;
}
