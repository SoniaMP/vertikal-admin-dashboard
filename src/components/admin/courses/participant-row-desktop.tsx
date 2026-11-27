import { Download } from "lucide-react";
import { TableRow } from "@/components/ui/table";
import { DataCell } from "@/components/admin/data-cell";
import { StatusPill, type PillTone } from "../status-pill";
import { DeleteEnrolleeButton } from "./delete-enrollee-button";
import { RowActions } from "@/components/admin/row-actions";
import type { ParticipantRow } from "./participants-table";

type Props = { participant: ParticipantRow; courseId: string };

/* The same five states as a membership, in the same five tones. "Manual"
   was blue here and "Pagado a mano" grey in the members table: one fact, two
   languages. */
const PAYMENT_STYLES: Record<string, { tone: PillTone; label: string }> = {
  COMPLETED: { tone: "positive", label: "Completado" },
  PENDING: { tone: "warning", label: "Pendiente" },
  FAILED: { tone: "negative", label: "Fallido" },
  REFUNDED: { tone: "neutral", label: "Reembolsado" },
  MANUAL: { tone: "neutral", label: "Pagado a mano" },
};

export function ParticipantRowDesktop({ participant: p, courseId }: Props) {
  const payment = PAYMENT_STYLES[p.paymentStatus];

  return (
    <TableRow className="h-12">
      <DataCell className="max-w-[180px] font-medium">{p.firstName}</DataCell>
      <DataCell className="max-w-[200px]">{p.lastName}</DataCell>
      <DataCell className="max-w-[240px] text-muted-foreground">
        {p.email}
      </DataCell>
      <DataCell className="text-muted-foreground">{p.phone ?? "—"}</DataCell>
      <DataCell className="text-muted-foreground">{p.dni ?? "—"}</DataCell>
      <DataCell className="text-muted-foreground">
        {p.dateOfBirth ?? "—"}
      </DataCell>
      <DataCell>{p.coursePrice.name}</DataCell>
      <DataCell kind="status">
        <StatusPill tone={payment?.tone ?? "neutral"}>
          {payment?.label ?? p.paymentStatus}
        </StatusPill>
      </DataCell>
      <DataCell className="text-muted-foreground">
        {p.licenseType ?? "—"}
      </DataCell>
      <DataCell>
        {p.licenseFileUrl ? (
          <a
            href={p.licenseFileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Descargar licencia (PDF)"
          >
            <Download className="size-4" />
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </DataCell>
      <DataCell kind="date" className="text-muted-foreground">
        {formatDate(p.createdAt)}
      </DataCell>
      <DataCell kind="actions">
        <RowActions>
          <DeleteEnrolleeButton
            registrationId={p.id}
            courseId={courseId}
            participantName={`${p.firstName} ${p.lastName}`}
          />
        </RowActions>
      </DataCell>
    </TableRow>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
