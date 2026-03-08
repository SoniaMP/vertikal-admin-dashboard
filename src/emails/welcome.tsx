import { Text } from "@react-email/components";
import { EmailLayout } from "./_components/email-layout";
import type { WelcomeProps } from "./types";

export default function Welcome({
  firstName,
  lastName,
  branding,
}: WelcomeProps) {
  return (
    <EmailLayout preview="Bienvenido/a a Club Vertikal" branding={branding}>
      <Text className="text-lg text-gray-900">
        Hola {firstName} {lastName},
      </Text>
      <Text className="text-gray-700 leading-6">
        ¡Bienvenido/a a Club Vertikal! Nos alegra mucho tenerte con nosotros.
      </Text>
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
        para no perderte nada. Y recuerda: estamos aquí para ayudarte en lo que
        necesites.
      </Text>
      <Text className="text-gray-700">¡Nos vemos en la montaña!</Text>
    </EmailLayout>
  );
}

Welcome.PreviewProps = {
  firstName: "Ana",
  lastName: "Martínez",
} satisfies WelcomeProps;
