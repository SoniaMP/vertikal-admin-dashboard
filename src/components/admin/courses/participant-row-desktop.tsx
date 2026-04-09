import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteEnrolleeButton } from "./delete-enrollee-button";
import type { ParticipantRow } from "./participants-table";

type Props = { participant: ParticipantRow; courseId: string };

const PAYMENT_STYLES: Record<string, { className: string; label: string }> = {
  COMPLETED: { className: "bg-green-100 text-green-800", label: "Completado" },
  PENDING: { className: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
  FAILED: { className: "bg-red-100 text-red-800", label: "Fallido" },
  REFUNDED: { className: "bg-gray-100 text-gray-800", label: "Reembolsado" },
};

export function ParticipantRowDesktop({ participant: p, courseId }: Props) {
  const payment = PAYMENT_STYLES[p.paymentStatus];

  return (
    <TableRow>
      <TableCell className="font-medium">{p.firstName}</TableCell>
      <TableCell>{p.lastName}</TableCell>
      <TableCell className="text-muted-foreground">{p.email}</TableCell>
      <TableCell className="text-muted-foreground">{p.phone ?? "—"}</TableCell>
      <TableCell className="text-muted-foreground">{p.dni ?? "—"}</TableCell>
      <TableCell className="text-muted-foreground">{p.dateOfBirth ?? "—"}</TableCell>
      <TableCell>{p.coursePrice.name}</TableCell>
      <TableCell>
        {payment ? (
          <Badge className={payment.className}>{payment.label}</Badge>
        ) : (
          <Badge variant="secondary">{p.paymentStatus}</Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(p.createdAt)}
      </TableCell>
      <TableCell>
        <DeleteEnrolleeButton
          registrationId={p.id}
          courseId={courseId}
          participantName={`${p.firstName} ${p.lastName}`}
        />
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
