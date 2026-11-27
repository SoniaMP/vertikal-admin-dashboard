import { Download } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
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
      <TableCell className="max-w-[180px] font-medium">{p.firstName}</TableCell>
      <TableCell className="max-w-[200px]">{p.lastName}</TableCell>
      <TableCell className="max-w-[240px] text-muted-foreground">
        {p.email}
      </TableCell>
      <TableCell className="text-muted-foreground">{p.phone ?? "—"}</TableCell>
      <TableCell className="text-muted-foreground">{p.dni ?? "—"}</TableCell>
      <TableCell className="text-muted-foreground">
        {p.dateOfBirth ?? "—"}
      </TableCell>
      <TableCell>{p.coursePrice.name}</TableCell>
      <TableCell>
        <StatusPill tone={payment?.tone ?? "neutral"}>
          {payment?.label ?? p.paymentStatus}
        </StatusPill>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {p.licenseType ?? "—"}
      </TableCell>
      <TableCell>
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
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(p.createdAt)}
      </TableCell>
      <TableCell>
        <RowActions>
          <DeleteEnrolleeButton
            registrationId={p.id}
            courseId={courseId}
            participantName={`${p.firstName} ${p.lastName}`}
          />
        </RowActions>
      </TableCell>
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
