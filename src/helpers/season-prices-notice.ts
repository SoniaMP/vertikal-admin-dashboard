import type { AttentionNotice } from "@/helpers/attention-notices";

/** How much warning the club gets before a season with no prices goes live. */
export const SEASON_PRICES_LEAD_DAYS = 45;

const LONG_DATE = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
});

export type SeasonPricesInput = {
  today: Date;
  /** The season registrations land in right now. */
  activeYear: number;
  activeHasPrices: boolean;
  /** The one after it, and the day it starts taking people. */
  upcomingYear: number;
  upcomingHasPrices: boolean;
  upcomingOpensOn: Date;
};

/**
 * Warns when a season is about to take registrations with no prices in it.
 *
 * This is the admin-side half of the public "plazo no abierto" screen: the
 * member is told to come back later, and the club is told why, with the link
 * that fixes it. A season with no prices sells nothing, so this is the one
 * state that silently closes the club to everybody.
 */
export function buildSeasonPricesNotice(
  input: SeasonPricesInput,
): AttentionNotice | null {
  const { activeYear, activeHasPrices } = input;

  if (!activeHasPrices) {
    return {
      id: "season-prices-missing",
      message: `Nadie puede inscribirse: la temporada ${activeYear} está vigente y no tiene ni un precio. El registro público dice que el plazo todavía no está abierto.`,
      actionLabel: "Poner precios",
      actionHref: `/admin/tipos-federacion?year=${activeYear}`,
    };
  }

  if (input.upcomingHasPrices) return null;
  if (daysUntil(input.today, input.upcomingOpensOn) > SEASON_PRICES_LEAD_DAYS) {
    return null;
  }

  return {
    id: "season-prices-upcoming",
    message: `El plazo de la temporada ${input.upcomingYear} se abre el ${LONG_DATE.format(input.upcomingOpensOn)} y todavía no tiene precios. Puedes clonarlos desde ${activeYear}.`,
    actionLabel: "Preparar temporada",
    actionHref: `/admin/tipos-federacion?year=${input.upcomingYear}`,
  };
}

function daysUntil(today: Date, target: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.ceil((target.getTime() - today.getTime()) / MS_PER_DAY);
}
