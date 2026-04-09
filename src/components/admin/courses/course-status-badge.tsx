import { Badge } from "@/components/ui/badge";
import type { CourseStatus } from "./types";

const STATUS_STYLES: Record<CourseStatus, { className: string; label: string }> = {
  DRAFT: { className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100", label: "Borrador" },
  ACTIVE: { className: "bg-green-100 text-green-800 hover:bg-green-100", label: "Activo" },
  INACTIVE: { className: "", label: "Inactivo" },
};

type Props = { status: string };

export function CourseStatusBadge({ status }: Props) {
  const style = STATUS_STYLES[status as CourseStatus];
  if (!style) return <Badge variant="secondary">{status}</Badge>;

  return style.className ? (
    <Badge className={style.className}>{style.label}</Badge>
  ) : (
    <Badge variant="secondary">{style.label}</Badge>
  );
}
