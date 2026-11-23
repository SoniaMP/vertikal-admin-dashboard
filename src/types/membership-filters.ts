export type SortField =
  | "memberName"
  | "email"
  | "totalAmount"
  | "createdAt"
  | "status"
  | "paymentStatus";

export type SortDirection = "asc" | "desc";

export type MembershipFilterState = {
  seasonId: string;
  search: string;
  paymentStatus: string;
  membershipStatus: string;
  federated: string;
  sex: string;
  typeId: string;
  subtypeId: string;
  categoryId: string;
  province: string;
  city: string;
  dateFrom: string;
  dateTo: string;
  view: string;
  sortBy: SortField;
  sortDir: SortDirection;
  page: number;
};

export type SeasonOption = {
  id: string;
  year: number;
};
