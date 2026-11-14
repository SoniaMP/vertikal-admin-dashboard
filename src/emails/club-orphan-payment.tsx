import { Text, Section, Row, Column } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";
import type { OrphanPaymentProps } from "./types";
import { formatPrice } from "./types";

export default function ClubOrphanPayment({
  recordKind,
  missingId,
  sessionId,
  payerEmail,
  amountCents,
  branding,
}: OrphanPaymentProps) {
  return (
    <EmailLayout preview="Cobro sin registro asociado" branding={branding}>
      <Text className="text-lg text-gray-900 font-bold">
        Cobro sin registro asociado
      </Text>
      <Text className="text-gray-700 leading-6">
        Stripe ha confirmado un pago cuya {recordKind} ya no existe en la base
        de datos, así que el cobro no se puede imputar a nadie. Lo habitual es
        que el registro se borrara mientras el pago estaba en curso.
      </Text>

      <Section className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
        <Text className="text-amber-900 font-bold mt-0 mb-1">
          Hay que devolver el dinero
        </Text>
        <Text className="text-amber-900 text-sm my-0">
          Busca la sesión en el panel de Stripe por el identificador de abajo y
          emite el reembolso desde allí. Nadie más va a avisar de esto.
        </Text>
      </Section>

      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <DetailRow label="Pagador" value={payerEmail ?? "sin registrar"} />
        <DetailRow
          label="Importe"
          value={amountCents === null ? "desconocido" : formatPrice(amountCents)}
        />
        <DetailRow label="Sesión" value={sessionId} />
        <DetailRow label="Registro" value={missingId} />
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

ClubOrphanPayment.PreviewProps = {
  recordKind: "membresía",
  missingId: "cmovw7ols000760vd6tkt3i25",
  sessionId: "cs_test_a1b2c3d4e5",
  payerEmail: "maria@example.com",
  amountCents: 8500,
} satisfies OrphanPaymentProps;
