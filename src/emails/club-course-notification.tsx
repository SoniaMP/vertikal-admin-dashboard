import { Text, Section, Row, Column } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";
import type { CourseNotificationProps } from "./types";
import { formatPrice } from "./types";

export default function ClubCourseNotification({
  fullName,
  dni,
  email,
  phone,
  courseTitle,
  coursePriceName,
  amountCents,
  branding,
}: CourseNotificationProps) {
  return (
    <EmailLayout
      preview={`Nueva inscripcion en curso — ${fullName}`}
      branding={branding}
    >
      <Text className="text-lg text-gray-900 font-bold">
        Nueva inscripcion en curso
      </Text>
      <Text className="text-gray-700 leading-6">
        Se ha registrado una nueva inscripcion en un curso.
      </Text>

      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Text className="text-gray-600 text-xs uppercase tracking-wide mt-0 mb-2">
          Datos del participante
        </Text>
        <DetailRow label="Nombre" value={fullName} />
        <DetailRow label="DNI" value={dni} />
        <DetailRow label="Email" value={email} />
        <DetailRow label="Telefono" value={phone} />
      </Section>

      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Text className="text-gray-600 text-xs uppercase tracking-wide mt-0 mb-2">
          Detalles del curso
        </Text>
        <DetailRow label="Curso" value={courseTitle} />
        <DetailRow label="Tarifa" value={coursePriceName} />
        <Row className="mt-4 border-t border-gray-200 pt-3">
          <Column className="text-gray-900 font-bold">Total</Column>
          <Column className="text-right text-gray-900 font-bold">
            {formatPrice(amountCents)}
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

ClubCourseNotification.PreviewProps = {
  fullName: "Carlos Lopez Martinez",
  dni: "87654321B",
  email: "carlos@example.com",
  phone: "698765432",
  courseTitle: "Iniciacion a la escalada deportiva",
  coursePriceName: "Socio",
  amountCents: 4500,
} satisfies CourseNotificationProps;
