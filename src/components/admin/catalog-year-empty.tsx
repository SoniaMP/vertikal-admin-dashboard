import { CalendarPlus } from "lucide-react";

type Props = {
  year: number;
  /** True when another season has prices this one could start from. */
  canClone: boolean;
};

/**
 * A year nobody has priced yet. It is not an error: preparing next season
 * starts here, with every combination still blank.
 *
 * It takes the panel's empty-state shape — centred column, one icon, no
 * dashed box — and says what to do next, because on a year with no season
 * row the header offers cloning and nothing else: "Nuevo tipo" needs a
 * season to hang from.
 */
export function CatalogYearEmpty({ year, canClone }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <CalendarPlus className="h-10 w-10" />
      <p className="text-sm">
        La temporada {year} todavía no tiene ningún precio configurado.
      </p>
      <p className="max-w-[52ch] text-xs">
        {canClone
          ? `Empieza clonando los de otra temporada, con el botón de arriba. Mientras siga así, nadie podrá federarse con el club cuando ${year} entre en vigor.`
          : `Mientras siga así, nadie podrá federarse con el club cuando ${year} entre en vigor.`}
      </p>
    </div>
  );
}
