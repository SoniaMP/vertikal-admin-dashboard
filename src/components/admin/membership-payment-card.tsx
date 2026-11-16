import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/helpers/price-calculator";
import { DetailField } from "./detail-field";
import { ExternalLicenseBadge } from "./external-license-badge";
import type { MembershipDetailData } from "./membership-detail-types";

type Props = { membership: MembershipDetailData };

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function clubLicenseLabel(m: MembershipDetailData): string {
  return (
    m.licenseLabelSnapshot ||
    [m.type?.name, m.subtype?.name].filter(Boolean).join(" - ") ||
    "Sin licencia"
  );
}

function ExternalLicenseSection({ membership: m }: Props) {
  return (
    <div className="space-y-2">
      <DetailField
        label="Licencia tramitada fuera del club"
        value={m.externalLicenseLabel?.trim() || "Sin indicar"}
      />
      <ExternalLicenseBadge
        membershipId={m.id}
        fileUrl={m.externalLicenseFileUrl}
        verifiedAt={m.externalLicenseVerifiedAt}
      />
    </div>
  );
}

export function MembershipPaymentCard({ membership: m }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pago y licencia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {m.hasClubLicense ? (
          <DetailField
            label="Licencia"
            value={`${clubLicenseLabel(m)} — ${formatPrice(m.licensePriceSnapshot)}`}
          />
        ) : (
          <ExternalLicenseSection membership={m} />
        )}
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
                  <span className="tabular-nums text-muted-foreground">
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
          <span className="tabular-nums">{formatPrice(m.totalAmount)}</span>
        </div>
        <Separator />
        <DetailField
          label="Email de confirmación enviado"
          value={m.confirmationSent ? "Si" : "No"}
        />
        {m.stripePaymentId && (
          <DetailField label="Stripe Payment ID" value={m.stripePaymentId} />
        )}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <DetailField label="Creado" value={formatDate(m.createdAt)} />
          <DetailField label="Actualizado" value={formatDate(m.updatedAt)} />
        </div>
      </CardContent>
    </Card>
  );
}
