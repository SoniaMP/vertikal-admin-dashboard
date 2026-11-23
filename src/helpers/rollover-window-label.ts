import { resolveRolloverWindow } from "@/helpers/rollover-window";

const LONG_DATE = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * The rollover days spelled out as the date they produce.
 *
 * A number of days is abstract and easy to get wrong by one — fifteen days
 * puts the opening on the 17th of December, not the 16th — so Ajustes states
 * the date the club will actually see.
 */
export function formatRolloverWindow(
  today: Date,
  rolloverDays: number,
): string {
  const { year, opensOn } = resolveRolloverWindow(today, rolloverDays);

  if (rolloverDays === 0) {
    return `Sin antelación: las altas de la temporada ${year} no empiezan hasta el 1 de enero de ${year}.`;
  }

  return `Con ${rolloverDays} días, las altas pasan a contar para la temporada ${year} a partir del ${LONG_DATE.format(opensOn)}.`;
}
