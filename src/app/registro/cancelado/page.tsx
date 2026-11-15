import Link from "next/link";
import { PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/helpers/price-calculator";
import { fetchPendingMembership } from "@/lib/pending-membership";
import { ResumePaymentButton } from "@/components/registration/resume-payment-button";

export const metadata = {
  title: "Pago cancelado - Club Vertikal",
  description: "El pago ha sido cancelado",
};

type CanceladoPageProps = {
  searchParams: Promise<{ membership_id?: string }>;
};

/**
 * Backing out of a card form is a choice, not an error, so this screen does
 * not wear an error's face. The membership was saved before the member was
 * sent to Stripe, so nothing they typed is lost and the way forward is one
 * button rather than the whole form again.
 */
export default async function CanceladoPage({
  searchParams,
}: CanceladoPageProps) {
  const { membership_id: membershipId } = await searchParams;
  const pending = membershipId
    ? await fetchPendingMembership(membershipId)
    : null;

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center px-4 py-10 text-center">
        <PauseCircle className="mb-6 size-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Pago cancelado</h2>
        <p className="mt-4 text-muted-foreground">
          No se ha realizado ningún cargo.
        </p>

        {pending && membershipId ? (
          <>
            <p className="mt-2 text-muted-foreground">
              Tu alta sigue guardada y no tendrás que rellenarla otra vez.
            </p>
            <p className="mt-4 text-lg font-semibold">
              {formatPrice(pending.totalAmount)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                temporada {pending.seasonName}
              </span>
            </p>
            <div className="mt-8 w-full">
              <ResumePaymentButton membershipId={membershipId} />
            </div>
            <Button variant="link" asChild className="mt-2 text-muted-foreground">
              <Link href="/">Lo dejo para otro momento</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-muted-foreground">
              Puedes volver a intentarlo cuando quieras.
            </p>
            <Button asChild className="mt-8">
              <Link href="/registro">Volver al registro</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
