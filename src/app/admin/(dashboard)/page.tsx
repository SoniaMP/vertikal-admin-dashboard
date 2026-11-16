import { getActiveSeason } from "@/lib/settings";
import {
  fetchMembershipList,
  fetchAllSeasons,
  fetchFilterOptions,
  fetchSeasonMetrics,
} from "@/lib/admin-queries";
import { parseFilterParams } from "@/lib/filter-params";
import { fetchLicenseCatalog } from "@/lib/license-catalog";
import { MembershipsToolbar } from "@/components/admin/memberships-toolbar";
import { AdvancedFiltersPanel } from "@/components/admin/advanced-filters-panel";
import { ActiveFilterChips } from "@/components/admin/active-filter-chips";
import { MembershipsTable } from "@/components/admin/memberships-table";
import { MembershipStatusTabs } from "@/components/admin/membership-status-tabs";
import { ExportButton } from "@/components/admin/export-button";
import { formatPendingFinding } from "@/helpers/pending-finding";
import { MEMBERSHIP_STATUS } from "@/types";
import { Pagination } from "@/components/admin/pagination";
import { CreateMemberButton } from "@/components/admin/create-member-button";
import { SeasonMetricsCards } from "@/components/admin/season-metrics";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [activeSeason, allSeasons] = await Promise.all([
    getActiveSeason(),
    fetchAllSeasons(),
  ]);

  const filters = parseFilterParams(params, activeSeason.id);
  const appliedFilters = applyViewOverrides(filters);

  const [catalog, filterOptions, metrics, { memberships, total, pageSize }] =
    await Promise.all([
      fetchLicenseCatalog(),
      fetchFilterOptions(),
      fetchSeasonMetrics(filters.seasonId),
      fetchMembershipList(appliedFilters),
    ]);

  const totalPages = Math.ceil(total / pageSize);
  const finding = formatPendingFinding(
    metrics.byStatus[MEMBERSHIP_STATUS.PENDING_PAYMENT] ?? 0,
    metrics.oldestPendingAt,
  );

  return (
    <div className="space-y-6">
      <PageHeader finding={finding} catalog={catalog} />
      <SeasonMetricsCards metrics={metrics} />
      <MembershipStatusTabs />
      <MembershipsToolbar
        allSeasons={allSeasons}
        currentSeasonId={filters.seasonId}
      />
      <AdvancedFiltersPanel filterOptions={filterOptions} />
      <ActiveFilterChips filterOptions={filterOptions} />
      <MembershipsTable
        memberships={memberships}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir}
      />
      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
      />
    </div>
  );
}

// ── Helpers ──

function applyViewOverrides(
  filters: import("@/types/membership-filters").MembershipFilterState,
) {
  if (filters.view === "federados") {
    return { ...filters, federated: "true" };
  }
  if (filters.view === "no_federados") {
    return { ...filters, federated: "false" };
  }
  return filters;
}

type PageHeaderProps = {
  /** What in this season's data needs attention, read before the table. */
  finding: string;
  catalog: Awaited<ReturnType<typeof fetchLicenseCatalog>>;
};

function PageHeader({ finding, catalog }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Miembros
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{finding}</p>
      </div>
      <div className="flex items-center gap-2">
        <ExportButton />
        <CreateMemberButton licenseCatalog={catalog} />
      </div>
    </div>
  );
}
