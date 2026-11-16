import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailField } from "./detail-field";
import { MembershipPaymentCard } from "./membership-payment-card";
import type { MembershipDetailData } from "./membership-detail-types";

type Props = { membership: MembershipDetailData };

function formatSex(value: string): string {
  if (value === "M") return "Hombre";
  if (value === "F") return "Mujer";
  return value;
}

function PersonalDataCard({ membership: m }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Datos personales</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <DetailField label="Nombre" value={m.member.firstName} />
        <DetailField label="Apellidos" value={m.member.lastName} />
        <DetailField label="Email" value={m.member.email} />
        <DetailField label="Teléfono" value={m.member.phone} />
        <DetailField label="DNI" value={m.member.dni} />
        <DetailField
          label="Fecha de nacimiento"
          value={m.member.dateOfBirth}
        />
        <DetailField label="Sexo" value={formatSex(m.member.sex)} />
        <DetailField label="Dirección" value={m.member.address} />
        <DetailField label="Ciudad" value={m.member.city} />
        <DetailField label="Código postal" value={m.member.postalCode} />
        <DetailField label="Provincia" value={m.member.province} />
      </CardContent>
    </Card>
  );
}

export function MembershipDetail({ membership: m }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PersonalDataCard membership={m} />
      <MembershipPaymentCard membership={m} />
    </div>
  );
}
