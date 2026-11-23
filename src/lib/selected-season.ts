import { getActiveSeason } from "@/lib/settings";
import { fetchAllSeasons } from "@/lib/admin-queries";
import { buildCatalogYears } from "@/helpers/catalog-years";
import { selectCatalogYear } from "@/helpers/selected-catalog-year";

export type SelectedSeason = {
  /** Every year the selector offers, oldest on record to five years out. */
  years: number[];
  selectedYear: number;
  /** The year new registrations land in today. */
  activeYear: number;
  /** Empty when that year has no season row, which means it has no rows at all. */
  seasonId: string;
};

/**
 * Which season the Miembros screen is looking at.
 *
 * Shared with the export so the file and the table can never disagree about
 * which year is on screen — the export reads the same query string.
 */
export async function resolveSelectedSeason(
  rawYear: string | undefined,
): Promise<SelectedSeason> {
  const [activeSeason, seasons] = await Promise.all([
    getActiveSeason(),
    fetchAllSeasons(),
  ]);

  const years = buildCatalogYears(
    seasons.map((season) => season.year),
    new Date().getFullYear(),
  );
  const selectedYear = selectCatalogYear(rawYear, years, activeSeason.year);

  return {
    years,
    selectedYear,
    activeYear: activeSeason.year,
    seasonId: seasons.find((s) => s.year === selectedYear)?.id ?? "",
  };
}
