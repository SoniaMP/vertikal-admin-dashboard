import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = { year: number };

/**
 * Why the club's own licence cannot be picked yet.
 *
 * The season always exists — it is a calendar year — but until somebody has
 * priced it there is nothing to sell. That only closes the federation half of
 * the alta: becoming a member is still possible, and so is joining with a
 * licence obtained elsewhere, which is what most people are doing in the days
 * before a season starts.
 *
 * It speaks the flow's own language rather than a framework's warning yellow:
 * a filled block in the ground tone, square, the icon in the club's green, and
 * the text at the size the rest of the form is read at. This is the one thing
 * on the step that has to be read, so it is not set in fine print.
 */
export function ClubLicensesClosedNotice({ year }: Props) {
  return (
    <Alert className="border-0 bg-[var(--ground)] px-5 py-4 has-[>svg]:grid-cols-[1.25rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-5 [&>svg]:translate-y-1 [&>svg]:text-primary">
      <Info aria-hidden="true" />
      <AlertDescription className="max-w-[68ch] text-[length:var(--step-body)] text-foreground">
        Todavía no se ha abierto el plazo para tramitar licencias federativas de
        la temporada {year}. Puedes darte de alta como socio si ya tienes una
        licencia en vigor; si querías que te la tramitemos nosotros, vuelve
        dentro de unos días.
      </AlertDescription>
    </Alert>
  );
}
