import { Info } from "lucide-react";

type Props = { year: number };

/**
 * Why the club's own licence cannot be picked yet.
 *
 * The season always exists — it is a calendar year — but until somebody has
 * priced it there is nothing to sell. That only closes the federation half of
 * the alta: becoming a member is still possible, and so is joining with a
 * licence obtained elsewhere, which is what most people are doing in the days
 * before a season starts.
 */
export function ClubLicensesClosedNotice({ year }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40">
      <Info
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400"
        aria-hidden="true"
      />
      <p className="text-amber-900 dark:text-amber-100">
        Todavía no se ha abierto el plazo para tramitar licencias federativas
        de la temporada {year}. Puedes darte de alta como socio si ya tienes
        una licencia en vigor; si querías que te la tramitemos nosotros, vuelve
        dentro de unos días.
      </p>
    </div>
  );
}
