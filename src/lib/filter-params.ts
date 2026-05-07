import type {
  MembershipFilterState,
  SortField,
  SortDirection,
} from "@/types/membership-filters";

const VALID_SORT_FIELDS: SortField[] = [
  "memberName",
  "email",
  "totalAmount",
  "createdAt",
  "status",
  "paymentStatus",
];

const VALID_SORT_DIRS: SortDirection[] = ["asc", "desc"];

const DEFAULT_SORT_BY: SortField = "createdAt";
const DEFAULT_SORT_DIR: SortDirection = "desc";
const DEFAULT_PAGE = 1;

type RawParams = Record<string, string | string[] | undefined>;

export function parseFilterParams(
  params: RawParams,
  defaultSeasonId: string,
): MembershipFilterState {
  const str = (key: string) => (typeof params[key] === "string" ? params[key] : "");

  const rawSort = str("sortBy") as SortField;
  const rawDir = str("sortDir") as SortDirection;

  return {
    seasonId: str("seasonId") || defaultSeasonId,
    search: str("search"),
    paymentStatus: str("paymentStatus"),
    membershipStatus: str("membershipStatus"),
    federated: str("federated"),
    sex: str("sex"),
    typeId: str("typeId"),
    subtypeId: str("subtypeId"),
    categoryId: str("categoryId"),
    province: str("province"),
    city: str("city"),
    dateFrom: str("dateFrom"),
    dateTo: str("dateTo"),
    view: str("view"),
    sortBy: VALID_SORT_FIELDS.includes(rawSort) ? rawSort : DEFAULT_SORT_BY,
    sortDir: VALID_SORT_DIRS.includes(rawDir) ? rawDir : DEFAULT_SORT_DIR,
    page: Math.max(1, Number(str("page")) || DEFAULT_PAGE),
  };
}

export function serializeFilters(
  filters: MembershipFilterState,
  defaultSeasonId: string,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.seasonId !== defaultSeasonId) {
    params.set("seasonId", filters.seasonId);
  }

  const stringKeys = [
    "search",
    "paymentStatus",
    "membershipStatus",
    "federated",
    "sex",
    "typeId",
    "subtypeId",
    "categoryId",
    "province",
    "city",
    "dateFrom",
    "dateTo",
    "view",
  ] as const;

  for (const key of stringKeys) {
    if (filters[key]) {
      params.set(key, filters[key]);
    }
  }

  if (filters.sortBy !== DEFAULT_SORT_BY) {
    params.set("sortBy", filters.sortBy);
  }
  if (filters.sortDir !== DEFAULT_SORT_DIR) {
    params.set("sortDir", filters.sortDir);
  }
  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  return params;
}

type FilterEntry = { key: string; label: string; value: string };

const FILTER_LABELS: Record<string, string> = {
  search: "Búsqueda",
  paymentStatus: "Estado pago",
  membershipStatus: "Estado membresía",
  federated: "Federado",
  sex: "Sexo",
  typeId: "Tipo",
  subtypeId: "Subtipo",
  categoryId: "Categoría",
  province: "Provincia",
  city: "Ciudad",
  dateFrom: "Desde",
  dateTo: "Hasta",
  view: "Vista",
};

const FEDERATED_LABELS: Record<string, string> = {
  true: "Sí",
  false: "No",
};

const SEX_LABELS: Record<string, string> = {
  M: "Hombre",
  F: "Mujer",
};

function getDisplayValue(key: string, value: string): string {
  if (key === "federated") return FEDERATED_LABELS[value] ?? value;
  if (key === "sex") return SEX_LABELS[value] ?? value;
  return value;
}

export function getActiveFilterEntries(
  filters: MembershipFilterState,
): FilterEntry[] {
  const entries: FilterEntry[] = [];
  const keys = Object.keys(FILTER_LABELS) as (keyof typeof FILTER_LABELS)[];

  for (const key of keys) {
    const value = filters[key as keyof MembershipFilterState];
    if (typeof value === "string" && value) {
      entries.push({
        key,
        label: FILTER_LABELS[key],
        value: getDisplayValue(key, value),
      });
    }
  }

  return entries;
}
