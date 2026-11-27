import type { ReactNode } from "react";
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
import { CatalogYearActions } from "@/components/admin/catalog-year-actions";
import { ClosedSeasonNotice } from "@/components/admin/closed-season-notice";
import { ClosedSeasonCatalog } from "@/components/admin/closed-season-catalog";
import { LicenseTypesTable } from "@/components/admin/license-types-table";
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
    include: { _count: { select: { memberships: true } } },
  });
  const clonableYears = selectClonableYears(yearsWithPrices, selectedYear);

  return (
    <div className="space-y-6">
      <CatalogHeader
        years={years}
        selectedYear={selectedYear}
        currentYear={currentYear}
        actions={
          !isClosed && (
            <CatalogYearActions
              year={selectedYear}
              seasonId={season?.id ?? null}
              clonableYears={clonableYears}
              hasPrices={yearsWithPrices.includes(selectedYear)}
              hasMemberships={(season?._count.memberships ?? 0) > 0}
              isActiveYear={selectedYear === activeSeason.year}
            />
          )
        }
      />
      {isClosed && <ClosedSeasonNotice year={selectedYear} />}
      <CatalogBody
        season={season}
        year={selectedYear}
        isClosed={isClosed}
        canClone={clonableYears.length > 0}
      />
    </div>
  );
}

type HeaderProps = {
  years: number[];
  selectedYear: number;
  currentYear: number;
  /** Year-wide controls; left out on a closed year. */
  actions: ReactNode;
};

function CatalogHeader({
  years,
  selectedYear,
  currentYear,
  actions,
}: HeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Federativas
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <CatalogYearSelector
          years={years}
          selectedYear={selectedYear}
          currentYear={currentYear}
        />
        {actions}
      </div>
    </div>
  );
}

type BodyProps = {
  season: Season | null;
  year: number;
  isClosed: boolean;
  canClone: boolean;
};

function CatalogBody({ season, year, isClosed, canClone }: BodyProps) {
  if (!season) {
    return isClosed ? (
      <p className="py-8 text-center text-muted-foreground">
        En {year} no hubo temporada.
      </p>
    ) : (
      <CatalogYearEmpty year={year} canClone={canClone} />
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
      {finding && <p className="text-sm text-muted-foreground">{finding}</p>}
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
        licenseTypes={licenseTypes}
        seasonId={seasonId}
      />
    </div>
  );
}
