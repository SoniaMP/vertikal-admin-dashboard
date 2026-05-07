import { describe, it, expect } from "vitest";
import { buildMembershipWhere, buildOrderBy } from "@/lib/admin-queries";
import type { MembershipFilterState } from "@/types/membership-filters";

function makeFilters(
  overrides: Partial<MembershipFilterState> = {},
): MembershipFilterState {
  return {
    seasonId: "season-1",
    search: "",
    paymentStatus: "",
    membershipStatus: "",
    federated: "",
    sex: "",
    typeId: "",
    subtypeId: "",
    categoryId: "",
    province: "",
    city: "",
    dateFrom: "",
    dateTo: "",
    view: "",
    sortBy: "createdAt",
    sortDir: "desc",
    page: 1,
    ...overrides,
  };
}

describe("buildMembershipWhere", () => {
  it("always includes seasonId", () => {
    const where = buildMembershipWhere(makeFilters());
    expect(where.AND).toContainEqual({ seasonId: "season-1" });
  });

  it("adds search condition with OR on member fields", () => {
    const where = buildMembershipWhere(makeFilters({ search: "garcia" }));
    const searchCondition = where.AND.find(
      (c: Record<string, unknown>) => "member" in c,
    );
    expect(searchCondition).toBeDefined();
    const member = (searchCondition as { member: { OR: unknown[] } }).member;
    expect(member.OR).toHaveLength(4);
  });

  it("adds paymentStatus filter", () => {
    const where = buildMembershipWhere(
      makeFilters({ paymentStatus: "COMPLETED" }),
    );
    expect(where.AND).toContainEqual({ paymentStatus: "COMPLETED" });
  });

  it("adds membershipStatus filter as status", () => {
    const where = buildMembershipWhere(
      makeFilters({ membershipStatus: "ACTIVE" }),
    );
    expect(where.AND).toContainEqual({ status: "ACTIVE" });
  });

  it("adds federated filter as boolean", () => {
    const whereTrue = buildMembershipWhere(
      makeFilters({ federated: "true" }),
    );
    expect(whereTrue.AND).toContainEqual({ isFederated: true });

    const whereFalse = buildMembershipWhere(
      makeFilters({ federated: "false" }),
    );
    expect(whereFalse.AND).toContainEqual({ isFederated: false });
  });

  it("adds sex filter scoped to member", () => {
    const whereM = buildMembershipWhere(makeFilters({ sex: "M" }));
    expect(whereM.AND).toContainEqual({ member: { sex: "M" } });

    const whereF = buildMembershipWhere(makeFilters({ sex: "F" }));
    expect(whereF.AND).toContainEqual({ member: { sex: "F" } });
  });

  it("ignores invalid or empty sex value", () => {
    const whereEmpty = buildMembershipWhere(makeFilters({ sex: "" }));
    const whereBogus = buildMembershipWhere(makeFilters({ sex: "X" }));
    const hasSex = (where: { AND: Record<string, unknown>[] }) =>
      where.AND.some(
        (c) =>
          "member" in c &&
          typeof c.member === "object" &&
          c.member !== null &&
          "sex" in (c.member as object),
      );
    expect(hasSex(whereEmpty)).toBe(false);
    expect(hasSex(whereBogus)).toBe(false);
  });

  it("ignores empty federated value", () => {
    const where = buildMembershipWhere(makeFilters({ federated: "" }));
    const hasFederated = where.AND.some(
      (c: Record<string, unknown>) => "isFederated" in c,
    );
    expect(hasFederated).toBe(false);
  });

  it("adds typeId, subtypeId, categoryId filters", () => {
    const where = buildMembershipWhere(
      makeFilters({ typeId: "t1", subtypeId: "s1", categoryId: "c1" }),
    );
    expect(where.AND).toContainEqual({ typeId: "t1" });
    expect(where.AND).toContainEqual({ subtypeId: "s1" });
    expect(where.AND).toContainEqual({ categoryId: "c1" });
  });

  it("adds date range filters", () => {
    const where = buildMembershipWhere(
      makeFilters({ dateFrom: "2025-01-01", dateTo: "2025-12-31" }),
    );
    const hasFrom = where.AND.some(
      (c: Record<string, unknown>) =>
        "createdAt" in c &&
        (c.createdAt as { gte?: Date }).gte instanceof Date,
    );
    const hasTo = where.AND.some(
      (c: Record<string, unknown>) =>
        "createdAt" in c &&
        (c.createdAt as { lte?: Date }).lte instanceof Date,
    );
    expect(hasFrom).toBe(true);
    expect(hasTo).toBe(true);
  });

  it("does not add conditions for empty filter values", () => {
    const where = buildMembershipWhere(makeFilters());
    expect(where.AND).toHaveLength(1);
    expect(where.AND[0]).toEqual({ seasonId: "season-1" });
  });
});

describe("buildOrderBy", () => {
  it("maps memberName to member.lastName", () => {
    expect(buildOrderBy("memberName", "asc")).toEqual({
      member: { lastName: "asc" },
    });
  });

  it("maps email to member.email", () => {
    expect(buildOrderBy("email", "desc")).toEqual({
      member: { email: "desc" },
    });
  });

  it("maps totalAmount directly", () => {
    expect(buildOrderBy("totalAmount", "asc")).toEqual({
      totalAmount: "asc",
    });
  });

  it("maps createdAt directly", () => {
    expect(buildOrderBy("createdAt", "desc")).toEqual({
      createdAt: "desc",
    });
  });

  it("maps status directly", () => {
    expect(buildOrderBy("status", "asc")).toEqual({ status: "asc" });
  });

  it("maps paymentStatus directly", () => {
    expect(buildOrderBy("paymentStatus", "desc")).toEqual({
      paymentStatus: "desc",
    });
  });
});
