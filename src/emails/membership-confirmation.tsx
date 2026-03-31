import { Text, Section, Row, Column } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";
import type { MembershipConfirmationProps } from "./types";
import { formatPrice } from "./types";

export default function MembershipConfirmation({
  firstName,
  lastName,
  licenseLabel,
  totalAmountCents,
  supplements,
  seasonName,
  branding,
}: MembershipConfirmationProps) {
  return (
    <EmailLayout
      preview={`Confirmación de inscripción — ${seasonName}`}
      branding={branding}
    >
      <Text className="text-lg text-gray-900">
        Hola {firstName} {lastName},
      </Text>
      <Text className="text-gray-700 leading-6">
        ¡Bienvenido/a a Club Vertikal! Nos alegra mucho tenerte con nosotros.
      </Text>
      <Text className="text-gray-700 leading-6">
        Tu inscripción para la temporada <strong>{seasonName}</strong> ha sido
        confirmada. Aquí tienes el resumen:
      </Text>

      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Row>
          <Column className="text-gray-600 text-sm">Licencia</Column>
          <Column className="text-right text-gray-900 font-medium text-sm">
            {licenseLabel}
          </Column>
        </Row>

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

      <Text className="text-gray-700 leading-6">
        Como miembro del club, podrás participar en las actividades organizadas
        y disfrutar de muchas más propuestas. Mantente atento al grupo de
        WhatsApp y al calendario de la web{" "}
        <a
          href="https://www.clubvertikal.es/calendario-actividades"
          target="_blank"
          rel="noopener noreferrer"
        >
          clubvertikal.es
        </a>{" "}
        para no perderte nada.
      </Text>
      <Text className="text-gray-700">¡Nos vemos en la montaña!</Text>
    </EmailLayout>
  );
}

MembershipConfirmation.PreviewProps = {
  firstName: "María",
  lastName: "García",
  email: "maria@example.com",
  licenseLabel: "Federativa — Adulto — Estándar",
  totalAmountCents: 8500,
  supplements: ["Seguro RC extra", "Alquiler taquilla"],
  seasonName: "2025-2026",
} satisfies MembershipConfirmationProps;
