import type { Season } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/settings";
import { fetchAdminLicenseCatalog } from "@/lib/admin-license-catalog";
import { buildCatalogYears } from "@/helpers/catalog-years";
import { selectCatalogYear } from "@/helpers/selected-catalog-year";
import { selectClonableYears } from "@/helpers/clonable-years";
import { isClosedSeason } from "@/helpers/closed-season";
import { formatLicenseCatalogFinding } from "@/helpers/license-catalog-finding";
import { CatalogYearSelector } from "@/components/admin/catalog-year-selector";
import { CatalogYearEmpty } from "@/components/admin/catalog-year-empty";
import { ClonePricesButton } from "@/components/admin/clone-prices-button";
import { ClosedSeasonNotice } from "@/components/admin/closed-season-notice";
import { ClosedSeasonCatalog } from "@/components/admin/closed-season-catalog";
import { LicenseTypesTable } from "@/components/admin/license-types-table";
import { CreateLicenseTypeButton } from "@/components/admin/create-license-type-button";
import { StandaloneSections } from "@/components/admin/standalone-sections";

type Props = {
  searchParams: Promise<{ year?: string }>;
};

/**
 * Two screens behind one route. An open year is an editor: prices, drafts,
 * every control the catalog needs. A closed year is a report of what the club
 * charged, and nothing on it can be touched — not even the names, which are
 * shared across every season and would quietly rewrite the live catalog.
 */
export default async function FederationTypesPage({ searchParams }: Props) {
  const [params, activeSeason, seasonsOnRecord] = await Promise.all([
    searchParams,
    getActiveSeason(),
    prisma.season.findMany({
      select: { year: true, _count: { select: { offerings: true } } },
    }),
  ]);

  const currentYear = new Date().getFullYear();
  const years = buildCatalogYears(
    seasonsOnRecord.map((season) => season.year),
    currentYear,
  );
  const selectedYear = selectCatalogYear(params.year, years, activeSeason.year);
  const isClosed = isClosedSeason(selectedYear, currentYear);
  const yearsWithPrices = seasonsOnRecord
    .filter((season) => season._count.offerings > 0)
    .map((season) => season.year);
  const season = await prisma.season.findUnique({
    where: { year: selectedYear },
  });

  return (
    <div className="space-y-6">
      <CatalogHeader
        years={years}
        selectedYear={selectedYear}
        currentYear={currentYear}
        clonableYears={selectClonableYears(yearsWithPrices, selectedYear)}
        willOverwrite={yearsWithPrices.includes(selectedYear)}
        isClosed={isClosed}
        seasonId={season?.id ?? null}
      />
      {isClosed && <ClosedSeasonNotice year={selectedYear} />}
      <CatalogBody season={season} year={selectedYear} isClosed={isClosed} />
    </div>
  );
}

type HeaderProps = {
  years: number[];
  selectedYear: number;
  currentYear: number;
  clonableYears: number[];
  willOverwrite: boolean;
  isClosed: boolean;
  seasonId: string | null;
};

function CatalogHeader({
  years,
  selectedYear,
  currentYear,
  clonableYears,
  willOverwrite,
  isClosed,
  seasonId,
}: HeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Federativas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los precios de cada año se guardan por separado.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <CatalogYearSelector
          years={years}
          selectedYear={selectedYear}
          currentYear={currentYear}
        />
        {!isClosed && (
          <>
            <ClonePricesButton
              targetYear={selectedYear}
              sourceYears={clonableYears}
              willOverwrite={willOverwrite}
            />
            {seasonId && <CreateLicenseTypeButton seasonId={seasonId} />}
          </>
        )}
      </div>
    </div>
  );
}

type BodyProps = {
  season: Season | null;
  year: number;
  isClosed: boolean;
};

function CatalogBody({ season, year, isClosed }: BodyProps) {
  if (!season) {
    return isClosed ? (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        En {year} no hubo temporada.
      </p>
    ) : (
      <CatalogYearEmpty year={year} />
    );
  }

  return isClosed ? (
    <ClosedSeasonCatalog seasonId={season.id} year={year} />
  ) : (
    <CatalogSections seasonId={season.id} year={year} />
  );
}

async function CatalogSections({
  seasonId,
  year,
}: {
  seasonId: string;
  year: number;
}) {
  const { licenseTypes, categories, supplements, supplementGroups } =
    await fetchAdminLicenseCatalog(seasonId);

  const finding = formatLicenseCatalogFinding(
    licenseTypes.map((type) => ({
      name: type.name,
      offeringCount: type.offerings.length,
    })),
    String(year),
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{finding}</p>
      <LicenseTypesTable
        licenseTypes={licenseTypes}
        categories={categories}
        seasonId={seasonId}
        seasonName={String(year)}
      />
      <StandaloneSections
        categories={categories}
        supplements={supplements}
        supplementGroups={supplementGroups}
        seasonId={seasonId}
      />
    </div>
  );
}
