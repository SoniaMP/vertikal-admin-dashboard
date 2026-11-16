import Link from "next/link";
import { Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  fetchCourseConfirmation,
  type CourseConfirmation,
} from "@/lib/stripe-confirm";
import { formatPrice } from "@/helpers/price-calculator";
import { UnconfirmedPaymentNotice } from "@/components/payment/unconfirmed-payment-notice";

export const metadata = {
  title: "Inscripción completada - Club Vertikal",
  description: "Tu inscripción al curso se ha completado correctamente",
};

type ExitoPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CursoExitoPage({
  searchParams,
}: ExitoPageProps) {
  const { session_id: sessionId } = await searchParams;

  const confirmation = sessionId
    ? await fetchCourseConfirmation(sessionId).catch(() => null)
    : null;

  if (!confirmation) {
    return (
      <UnconfirmedPaymentNotice
        backHref="/cursos"
        backLabel="Volver a cursos"
        subject="No tengo la confirmación de mi inscripción a un curso"
      />
    );
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center text-center">
        <h1 className="text-[length:var(--step-head)] font-semibold leading-none tracking-[-0.035em]">¡Inscripción completada!</h1>
        <p className="mt-4 max-w-lg">
          Gracias por inscribirte, {confirmation.firstName}.
        </p>
        <p className="mt-2 max-w-md text-xs text-muted-foreground">
          Recibirás un correo electrónico a{" "}
          <span className="font-medium">{confirmation.email}</span> con la
          confirmación de tu inscripción.
        </p>

        <div className="mt-6 w-full max-w-sm text-left">
          <h3 className="mb-3 text-center text-lg font-semibold">
            Resumen de tu inscripción
          </h3>
          <ConfirmationDetails data={confirmation} />
        </div>

        <Separator className="my-4 max-w-md" />

        <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-primary">
          <Mountain className="size-5" />
          <span>Nos vemos en las montañas</span>
        </div>

        <Button variant="outline" asChild className="mt-6">
          <Link href="/cursos">Ver cursos</Link>
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          Puedes cerrar esta página con seguridad.
        </p>
      </CardContent>
    </Card>
  );
}

function ConfirmationDetails({ data }: { data: CourseConfirmation }) {
  return (
    <div className="space-y-2 text-sm">
      <SummaryRow
        label="Nombre"
        value={`${data.firstName} ${data.lastName}`}
      />
      <SummaryRow label="Curso" value={data.courseTitle} />
      <SummaryRow label="Tarifa" value={data.priceName} />
      <SummaryRow
        label="Total pagado"
        value={formatPrice(data.amountCents)}
        isBold
      />
    </div>
  );
}

type SummaryRowProps = { label: string; value: string; isBold?: boolean };

function SummaryRow({ label, value, isBold }: SummaryRowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={isBold ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
