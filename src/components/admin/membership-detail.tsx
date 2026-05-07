import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/helpers/price-calculator";

type MembershipDetailData = {
  id: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  licensePriceSnapshot: number;
  licenseLabelSnapshot: string;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  confirmationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
  member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    dateOfBirth: string;
    sex: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
  };
  type: { name: string } | null;
  subtype: { name: string } | null;
  supplements: {
    priceAtTime: number;
    supplement: { name: string };
  }[];
};

type Props = { membership: MembershipDetailData };

const PAYMENT_LABELS: Record<string, string> = {
  COMPLETED: "Completado",
  PENDING: "Pendiente",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

const PAYMENT_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  COMPLETED: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  ACTIVE: "Activo",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING_PAYMENT: "secondary",
  ACTIVE: "default",
  EXPIRED: "outline",
  CANCELLED: "destructive",
};

function formatSex(value: string): string {
  if (value === "M") return "Hombre";
  if (value === "F") return "Mujer";
  return value;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export function MembershipDetail({ membership: m }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PersonalDataCard membership={m} />
      <PaymentCard membership={m} />
    </div>
  );
}

function PersonalDataCard({ membership: m }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Datos personales</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Field label="Nombre" value={m.member.firstName} />
        <Field label="Apellidos" value={m.member.lastName} />
        <Field label="Email" value={m.member.email} />
        <Field label="Telefono" value={m.member.phone} />
        <Field label="DNI" value={m.member.dni} />
        <Field label="Fecha de nacimiento" value={m.member.dateOfBirth} />
        <Field label="Sexo" value={formatSex(m.member.sex)} />
        <Field label="Direccion" value={m.member.address} />
        <Field label="Ciudad" value={m.member.city} />
        <Field label="Codigo postal" value={m.member.postalCode} />
        <Field label="Provincia" value={m.member.province} />
      </CardContent>
    </Card>
  );
}

function PaymentCard({ membership: m }: Props) {
  const licenseLabel = m.licenseLabelSnapshot
    || [m.type?.name, m.subtype?.name].filter(Boolean).join(" - ")
    || "Sin licencia";
  const licensePrice = m.licensePriceSnapshot;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pago y licencia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Estado de la membresia</span>
          <Badge variant={STATUS_VARIANTS[m.status] ?? "outline"}>
            {STATUS_LABELS[m.status] ?? m.status}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Estado del pago</span>
          <Badge variant={PAYMENT_VARIANTS[m.paymentStatus] ?? "outline"}>
            {PAYMENT_LABELS[m.paymentStatus] ?? m.paymentStatus}
          </Badge>
        </div>
        <Separator />
        <Field
          label="Licencia"
          value={`${licenseLabel} — ${formatPrice(licensePrice)}`}
        />
        {m.supplements.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Suplementos</p>
            <ul className="space-y-1">
              {m.supplements.map((s) => (
                <li
                  key={s.supplement.name}
                  className="text-sm flex justify-between"
                >
                  <span>{s.supplement.name}</span>
                  <span className="text-muted-foreground">
                    {formatPrice(s.priceAtTime)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(m.totalAmount)}</span>
        </div>
        <Separator />
        <Field
          label="Email de confirmacion enviado"
          value={m.confirmationSent ? "Si" : "No"}
        />
        {m.stripePaymentId && (
          <Field label="Stripe Payment ID" value={m.stripePaymentId} />
        )}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Field label="Creado" value={formatDate(m.createdAt)} />
          <Field label="Actualizado" value={formatDate(m.updatedAt)} />
        </div>
      </CardContent>
    </Card>
  );
}
