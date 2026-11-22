import { CalendarPlus } from "lucide-react";

type Props = {
  year: number;
};

/**
 * A year nobody has priced yet. It is not an error: preparing next season
 * starts here, with every combination still blank.
 */
export function CatalogYearEmpty({ year }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
      <CalendarPlus className="h-10 w-10" />
      <p className="text-sm">
        La temporada {year} todavía no tiene ningún precio configurado.
      </p>
      <p className="max-w-md text-xs">
        Mientras siga así, nadie podrá inscribirse cuando {year} entre en vigor.
      </p>
    </div>
  );
}
