import { Text, Section, Row, Column } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";
import type { MembershipNotificationProps } from "./types";
import { formatPrice } from "./types";

export default function ClubMembershipNotification({
  fullName,
  dni,
  email,
  phone,
  address,
  city,
  postalCode,
  province,
  licenseLabel,
  supplements,
  totalAmountCents,
  seasonName,
  branding,
}: MembershipNotificationProps) {
  return (
    <EmailLayout
      preview={`Nueva inscripcion de socio — ${fullName}`}
      branding={branding}
    >
      <Text className="text-lg text-gray-900 font-bold">
        Nueva inscripcion de socio
      </Text>
      <Text className="text-gray-700 leading-6">
        Se ha registrado una nueva inscripcion para la temporada{" "}
        <strong>{seasonName}</strong>.
      </Text>

      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Text className="text-gray-600 text-xs uppercase tracking-wide mt-0 mb-2">
          Datos del socio
        </Text>
        <DetailRow label="Nombre" value={fullName} />
        <DetailRow label="DNI" value={dni} />
        <DetailRow label="Email" value={email} />
        <DetailRow label="Telefono" value={phone} />
        <DetailRow
          label="Direccion"
          value={`${address}, ${postalCode} ${city} (${province})`}
        />
      </Section>

      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Text className="text-gray-600 text-xs uppercase tracking-wide mt-0 mb-2">
          Detalles de la inscripcion
        </Text>
        <DetailRow label="Licencia" value={licenseLabel} />

        {supplements.length > 0 && (
          <>
            <Text className="text-gray-600 text-sm mt-3 mb-1">
              Suplementos:
            </Text>
            {supplements.map((name) => (
              <Text key={name} className="text-gray-900 text-sm ml-2 my-0">
                • {name}
              </Text>
            ))}
          </>
        )}

        <Row className="mt-4 border-t border-gray-200 pt-3">
          <Column className="text-gray-900 font-bold">Total</Column>
          <Column className="text-right text-gray-900 font-bold">
            {formatPrice(totalAmountCents)}
          </Column>
        </Row>
      </Section>
    </EmailLayout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Row className="mt-1">
      <Column className="text-gray-600 text-sm w-[100px]">{label}</Column>
      <Column className="text-gray-900 text-sm">{value}</Column>
    </Row>
  );
}

ClubMembershipNotification.PreviewProps = {
  fullName: "Maria Garcia Lopez",
  dni: "12345678A",
  email: "maria@example.com",
  phone: "612345678",
  address: "Calle Mayor 10",
  city: "Madrid",
  postalCode: "28001",
  province: "Madrid",
  licenseLabel: "Federativa — Adulto — Estandar",
  supplements: ["Seguro RC extra", "Alquiler taquilla"],
  totalAmountCents: 8500,
  seasonName: "2025-2026",
} satisfies MembershipNotificationProps;
