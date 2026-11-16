import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClubContactLink } from "@/components/contact/club-contact-link";

type UnconfirmedPaymentNoticeProps = {
  backHref: string;
  backLabel: string;
  /** What was being paid for, so the member's email says it too. */
  subject: string;
};

/**
 * Shown when the member comes back from Stripe but the webhook has not landed
 * yet. The card used to end on "recibirás la confirmación en breve", which
 * leaves someone who just paid 90 € with nobody to ask and one obvious wrong
 * move: paying again. So it names the address and rules that out.
 */
export function UnconfirmedPaymentNotice({
  backHref,
  backLabel,
  subject,
}: UnconfirmedPaymentNoticeProps) {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="flex flex-col items-center px-4 py-10 text-center">
        <AlertTriangle className="mb-6 size-16 text-yellow-500" />
        <h2 className="text-2xl font-bold">No se pudo confirmar el pago</h2>
        <p className="mt-4 text-muted-foreground">
          Si realizaste el pago, recibirás la confirmación en breve por email.
        </p>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          <span className="font-medium text-foreground">No vuelvas a pagar.</span>{" "}
          Si hoy no te llega el correo, escríbenos a{" "}
          <ClubContactLink subject={subject} /> con tu nombre y lo comprobamos
          nosotros.
        </p>
        <Button asChild className="mt-8">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
