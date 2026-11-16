import Link from "next/link";
import { Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchMembershipConfirmation } from "@/lib/stripe-confirm";
import { ConfirmationSummary } from "@/components/registration/confirmation-summary";
import { UnconfirmedPaymentNotice } from "@/components/payment/unconfirmed-payment-notice";

export const metadata = {
  title: "Registro completado - Club Vertikal",
  description: "Tu registro se ha completado correctamente",
};

type ExitoPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function ExitoPage({ searchParams }: ExitoPageProps) {
  const { session_id: sessionId } = await searchParams;

  const confirmation = sessionId
    ? await fetchMembershipConfirmation(sessionId).catch(() => null)
    : null;

  if (!confirmation) {
    return (
      <UnconfirmedPaymentNotice
        backHref="/"
        backLabel="Volver al inicio"
        subject="No tengo la confirmación de mi alta de socio"
      />
    );
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center text-center">
        <h1 className="text-[length:var(--step-head)] font-semibold leading-none tracking-[-0.035em]">
          ¡Bienvenido/a al Club Vertikal!
        </h1>
        <p className="mt-4 max-w-lg">
          ¡Gracias por registrarte con nosotros!
        </p>
        <p className="mt-2 text-xs text-muted-foreground max-w-md">
          Recibirás un correo
          electrónico a <span className="font-medium">{confirmation.member.email}</span> con
          la información de tu registro.
        </p>

        <div className="mt-4">
          <h3 className="mb-4 text-lg font-semibold">Resumen de tu registro</h3>
        </div>

        <ConfirmationSummary data={confirmation} />

        <Separator className="my-4 max-w-md" />

        <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-primary">
          <Mountain className="size-5" />
          <span>Nos vemos en las montañas</span>
        </div>

        <Button asChild className="mt-8">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
