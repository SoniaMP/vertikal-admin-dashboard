import { Badge } from "@/components/ui/badge";
import type { CourseStatus } from "./types";

const STATUS_STYLES: Record<CourseStatus, { className: string; label: string }> = {
  DRAFT: { className: "bg-orange-100 text-orange-800 hover:bg-orange-100", label: "Borrador" },
  ACTIVE: { className: "bg-green-100 text-green-800 hover:bg-green-100", label: "Activo" },
  INACTIVE: { className: "bg-red-100 text-red-800 hover:bg-red-100", label: "Inactivo" },
};

type Props = { status: string };

export function CourseStatusBadge({ status }: Props) {
  const style = STATUS_STYLES[status as CourseStatus];
  if (!style) return <Badge variant="secondary">{status}</Badge>;

  return <Badge className={style.className}>{style.label}</Badge>;
}
