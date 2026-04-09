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

export function ParticipantRowMobile({ participant: p, courseId }: Props) {
  const payment = PAYMENT_STYLES[p.paymentStatus];

  return (
    <div className="rounded-lg border p-4 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium truncate">
            {p.firstName} {p.lastName}
          </p>
          <p className="text-sm text-muted-foreground truncate">{p.email}</p>
        </div>
        <div className="flex items-center gap-1">
          {payment ? (
            <Badge className={payment.className}>{payment.label}</Badge>
          ) : (
            <Badge variant="secondary">{p.paymentStatus}</Badge>
          )}
          <DeleteEnrolleeButton
            registrationId={p.id}
            courseId={courseId}
            participantName={`${p.firstName} ${p.lastName}`}
          />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {p.dni && <span>DNI: {p.dni}</span>}
        {p.phone && <span>{p.phone}</span>}
        <span>{p.coursePrice.name}</span>
        <span className="ml-auto">{formatDate(p.createdAt)}</span>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
