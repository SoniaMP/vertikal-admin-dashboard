import { RegistrationHeader } from "./registration-header";

type Props = { year: number };

/**
 * What the public sees while next season's prices are still being set.
 *
 * The season always exists — it is a calendar year — but a season with
 * nothing on offer cannot take anybody. Saying the window is not open yet is
 * the honest version of that, and it buys the club the days it needs to get
 * the catalog ready. The alternative would be selling last year's prices or
 * showing a broken page.
 */
export function RegistrationClosed({ year }: Props) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <RegistrationHeader
        title={`Temporada ${year}`}
        lead={`Todavía no se ha abierto el plazo de inscripciones para la temporada ${year}.`}
      />
      <p className="mt-6 text-muted-foreground">
        Vuelve dentro de unos días. Si tienes prisa o alguna duda, escríbenos y
        te avisamos en cuanto esté abierto.
      </p>
    </div>
  );
}
