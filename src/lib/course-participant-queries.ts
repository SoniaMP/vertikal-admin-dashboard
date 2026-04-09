import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 15;
const MAX_EXPORT_ROWS = 5000;

const VALID_SORT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "priceName",
  "createdAt",
] as const;

type ParticipantSortField = (typeof VALID_SORT_FIELDS)[number];

export type ParticipantFilters = {
  courseId: string;
  search?: string;
  sortBy: ParticipantSortField;
  sortDir: "asc" | "desc";
  page: number;
};

// ── Paginated participant list ──

export async function fetchCourseParticipants(filters: ParticipantFilters) {
  const where = buildParticipantWhere(filters);
  const orderBy = buildParticipantOrderBy(filters.sortBy, filters.sortDir);

  const [participants, total] = await Promise.all([
    prisma.courseRegistration.findMany({
      where,
      include: { coursePrice: { select: { name: true } } },
      orderBy,
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.courseRegistration.count({ where }),
  ]);

  return { participants, total, pageSize: PAGE_SIZE };
}

// ── All participants for CSV export ──

export async function fetchAllCourseParticipants(courseId: string) {
  return prisma.courseRegistration.findMany({
    where: { courseCatalogId: courseId },
    include: { coursePrice: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: MAX_EXPORT_ROWS,
  });
}

// ── URL param parser ──

export function parseParticipantParams(
  params: Record<string, string | string[] | undefined>,
  courseId: string,
): ParticipantFilters {
  const str = (key: string) => {
    const v = params[key];
    return typeof v === "string" ? v : undefined;
  };

  const rawSort = str("sortBy");
  const sortBy = isValidSortField(rawSort) ? rawSort : "createdAt";

  const rawDir = str("sortDir");
  const sortDir = rawDir === "asc" || rawDir === "desc" ? rawDir : "desc";

  return {
    courseId,
    search: str("search"),
    sortBy,
    sortDir,
    page: Math.max(1, Number(str("page")) || 1),
  };
}

// ── Internal helpers ──

function isValidSortField(value: unknown): value is ParticipantSortField {
  return VALID_SORT_FIELDS.includes(value as ParticipantSortField);
}

function buildParticipantWhere(filters: ParticipantFilters) {
  const conditions: Record<string, unknown>[] = [
    { courseCatalogId: filters.courseId },
  ];

  if (filters.search) {
    const term = filters.search;
    conditions.push({
      OR: [
        { firstName: { contains: term } },
        { lastName: { contains: term } },
        { email: { contains: term } },
        { dni: { contains: term } },
      ],
    });
  }

  return { AND: conditions };
}

function buildParticipantOrderBy(
  sortBy: ParticipantSortField,
  sortDir: "asc" | "desc",
) {
  const map: Record<ParticipantSortField, Record<string, unknown>> = {
    firstName: { firstName: sortDir },
    lastName: { lastName: sortDir },
    email: { email: sortDir },
    phone: { phone: sortDir },
    priceName: { coursePrice: { name: sortDir } },
    createdAt: { createdAt: sortDir },
  };
  return map[sortBy] ?? { createdAt: "desc" };
}
