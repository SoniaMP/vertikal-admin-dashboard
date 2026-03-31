import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pago cancelado - Club Vertikal",
  description: "El pago del curso ha sido cancelado",
};

export default function CursoCanceladoPage() {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <XCircle className="mb-6 size-16 text-destructive" />
      <h2 className="text-2xl font-bold">Pago cancelado</h2>
      <p className="mt-4 text-muted-foreground">
        El proceso de pago ha sido cancelado. No se ha realizado ningún cargo.
      </p>
      <p className="mt-2 text-muted-foreground">
        Puedes volver a intentarlo cuando quieras.
      </p>
      <Button asChild className="mt-8">
        <Link href="/cursos">Volver a cursos</Link>
      </Button>
    </div>
  );
}
