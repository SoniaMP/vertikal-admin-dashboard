import { Text, Section } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";
import type { RenewalCodeProps } from "./types";

export default function RenewalCode({
  firstName,
  code,
  expiresInMinutes,
  branding,
}: RenewalCodeProps) {
  return (
    <EmailLayout preview="Tu código para renovar" branding={branding}>
      <Text className="text-lg text-gray-900 font-bold">
        Hola {firstName}, aquí tienes tu código
      </Text>
      <Text className="text-gray-700 leading-6">
        Úsalo en la pantalla de renovación para recuperar tus datos y no tener
        que escribirlos otra vez.
      </Text>

      <Section className="bg-gray-50 rounded-lg p-6 my-4 text-center">
        <Text className="text-3xl font-bold tracking-[0.3em] text-gray-900 my-0">
          {code}
        </Text>
        <Text className="text-gray-600 text-sm mt-2 mb-0">
          Caduca en {expiresInMinutes} minutos
        </Text>
      </Section>

      <Text className="text-gray-600 text-sm leading-6">
        Si no has pedido este código, puedes ignorar este correo: sin él nadie
        puede ver tus datos. Nadie del club te lo va a pedir por teléfono ni
        por mensaje.
      </Text>
    </EmailLayout>
  );
}

RenewalCode.PreviewProps = {
  firstName: "María",
  code: "483912",
  expiresInMinutes: 15,
} satisfies RenewalCodeProps;
