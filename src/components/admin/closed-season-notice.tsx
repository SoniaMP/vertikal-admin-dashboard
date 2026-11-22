import { Lock } from "lucide-react";

type Props = {
  year: number;
};

/**
 * A year that has already gone by. Its prices are the ones members were
 * charged, so the screen shows them and offers nothing to change.
 */
export function ClosedSeasonNotice({ year }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      <Lock className="h-4 w-4 shrink-0" />
      <span>
        La temporada {year} está cerrada. Sus precios son solo de consulta: son
        los que se cobraron.
      </span>
    </div>
  );
}
