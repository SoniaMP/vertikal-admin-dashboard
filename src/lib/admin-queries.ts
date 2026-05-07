import { prisma } from "@/lib/prisma";
import type {
  MembershipFilterState,
  SeasonOption,
  SortField,
} from "@/types/membership-filters";

const PAGE_SIZE = 15;

export type SeasonMetrics = {
  totalMembers: number;
  byStatus: Record<string, number>;
  byPaymentStatus: Record<string, number>;
  totalRevenue: number;
  federatedCount: number;
};

// ── Membership list with filters, pagination, sorting ──

export async function fetchMembershipList(filters: MembershipFilterState) {
  const where = buildMembershipWhere(filters);
  const orderBy = buildOrderBy(filters.sortBy, filters.sortDir);

  const [memberships, total] = await Promise.all([
    prisma.membership.findMany({
      where,
      include: {
        member: true,
        type: { select: { id: true, name: true } },
        subtype: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy,
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.membership.count({ where }),
  ]);

  return { memberships, total, pageSize: PAGE_SIZE };
}

// ── Season metrics ──

export async function fetchSeasonMetrics(
  seasonId: string,
): Promise<SeasonMetrics> {
  const base = { seasonId };

  const [total, statusGroups, paymentGroups, revenue, federated] =
    await Promise.all([
      prisma.membership.count({ where: base }),
      prisma.membership.groupBy({
        by: ["status"],
        where: base,
        _count: true,
      }),
      prisma.membership.groupBy({
        by: ["paymentStatus"],
        where: base,
        _count: true,
      }),
      prisma.membership.aggregate({
        where: { ...base, paymentStatus: "COMPLETED" },
        _sum: { totalAmount: true },
      }),
      prisma.membership.count({
        where: { ...base, isFederated: true },
      }),
    ]);

  const byStatus: Record<string, number> = {};
  for (const g of statusGroups) {
    byStatus[g.status] = g._count;
  }

  const byPaymentStatus: Record<string, number> = {};
  for (const g of paymentGroups) {
    byPaymentStatus[g.paymentStatus] = g._count;
  }

  return {
    totalMembers: total,
    byStatus,
    byPaymentStatus,
    totalRevenue: (revenue._sum.totalAmount ?? 0) / 100,
    federatedCount: federated,
  };
}

// ── Not renewed members ──

export async function fetchNotRenewedMembers(
  currentSeasonId: string,
  previousSeasonId: string,
  page: number,
) {
  const previousActive = await prisma.membership.findMany({
    where: { seasonId: previousSeasonId, status: "ACTIVE" },
    select: { memberId: true },
  });
  const previousMemberIds = previousActive.map((m) => m.memberId);

  if (previousMemberIds.length === 0) {
    return { members: [], total: 0, pageSize: PAGE_SIZE };
  }

  const currentMemberships = await prisma.membership.findMany({
    where: { seasonId: currentSeasonId, memberId: { in: previousMemberIds } },
    select: { memberId: true },
  });
  const renewedIds = new Set(currentMemberships.map((m) => m.memberId));
  const notRenewedIds = previousMemberIds.filter((id) => !renewedIds.has(id));

  if (notRenewedIds.length === 0) {
    return { members: [], total: 0, pageSize: PAGE_SIZE };
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where: { id: { in: notRenewedIds } },
      orderBy: { lastName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    Promise.resolve(notRenewedIds.length),
  ]);

  return { members, total, pageSize: PAGE_SIZE };
}

// ── Filter options for advanced panel ──

export type FilterOption = { id: string; name: string };
export type SubtypeOption = FilterOption & { typeId: string };

export type FilterOptions = {
  types: FilterOption[];
  subtypes: SubtypeOption[];
  categories: FilterOption[];
};

export async function fetchFilterOptions(): Promise<FilterOptions> {
  const [types, subtypes, categories] = await Promise.all([
    prisma.licenseType.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.licenseSubtype.findMany({
      where: { active: true },
      select: { id: true, name: true, licenseTypeId: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    types,
    subtypes: subtypes.map((s) => ({
      id: s.id,
      name: s.name,
      typeId: s.licenseTypeId,
    })),
    categories,
  };
}

// ── Auxiliary ──

export async function fetchAllSeasons(): Promise<SeasonOption[]> {
  const seasons = await prisma.season.findMany({
    select: { id: true, name: true, isActive: true },
    orderBy: { startDate: "desc" },
  });
  return seasons;
}

export async function getPreviousSeason(
  currentSeasonId: string,
): Promise<SeasonOption | null> {
  const current = await prisma.season.findUnique({
    where: { id: currentSeasonId },
    select: { startDate: true },
  });
  if (!current) return null;

  const previous = await prisma.season.findFirst({
    where: { startDate: { lt: current.startDate } },
    orderBy: { startDate: "desc" },
    select: { id: true, name: true, isActive: true },
  });
  return previous;
}

// ── Internal helpers ──

type SortDir = "asc" | "desc";

function buildOrderBy(sortBy: SortField, sortDir: SortDir) {
  const map: Record<SortField, Record<string, unknown>> = {
    memberName: { member: { lastName: sortDir } },
    email: { member: { email: sortDir } },
    totalAmount: { totalAmount: sortDir },
    createdAt: { createdAt: sortDir },
    status: { status: sortDir },
    paymentStatus: { paymentStatus: sortDir },
  };
  return map[sortBy] ?? { createdAt: "desc" };
}

function buildMembershipWhere(filters: MembershipFilterState) {
  const conditions: Record<string, unknown>[] = [{ seasonId: filters.seasonId }];

  if (filters.search) {
    const term = filters.search;
    conditions.push({
      member: {
        OR: [
          { firstName: { contains: term } },
          { lastName: { contains: term } },
          { dni: { contains: term } },
          { email: { contains: term } },
        ],
      },
    });
  }

  if (filters.paymentStatus) {
    conditions.push({ paymentStatus: filters.paymentStatus });
  }

  if (filters.membershipStatus) {
    conditions.push({ status: filters.membershipStatus });
  }

  if (filters.federated === "true" || filters.federated === "false") {
    conditions.push({ isFederated: filters.federated === "true" });
  }

  if (filters.sex === "M" || filters.sex === "F") {
    conditions.push({ member: { sex: filters.sex } });
  }

  if (filters.typeId) {
    conditions.push({ typeId: filters.typeId });
  }

  if (filters.subtypeId) {
    conditions.push({ subtypeId: filters.subtypeId });
  }

  if (filters.categoryId) {
    conditions.push({ categoryId: filters.categoryId });
  }

  if (filters.province) {
    conditions.push({ member: { province: { contains: filters.province } } });
  }

  if (filters.city) {
    conditions.push({ member: { city: { contains: filters.city } } });
  }

  if (filters.dateFrom) {
    conditions.push({ createdAt: { gte: new Date(filters.dateFrom) } });
  }

  if (filters.dateTo) {
    conditions.push({ createdAt: { lte: new Date(filters.dateTo) } });
  }

  return { AND: conditions };
}

export { buildMembershipWhere, buildOrderBy, PAGE_SIZE };
