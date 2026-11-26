// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SupplementsSection } from "../supplements-section";
import { SupplementGroupRow } from "../supplement-group-row";

vi.mock("@/app/admin/(dashboard)/tipos-federacion/actions", () => ({
  upsertSupplementPrice: vi.fn(),
  upsertSupplementGroupPrice: vi.fn(),
  toggleSupplementActive: vi.fn(),
  deleteSupplementGroup: vi.fn(),
  createSupplement: vi.fn(),
  updateSupplement: vi.fn(),
  createSupplementGroup: vi.fn(),
  updateSupplementGroup: vi.fn(),
  findPropagationTargets: vi.fn().mockResolvedValue({
    name: "",
    active: true,
    sourceYear: 2026,
    years: [],
  }),
  propagateCatalogChange: vi.fn(),
}));

const SEASON = "season-1";
const FERM = {
  id: "ferm",
  name: "FERM",
  active: true,
  publishedAt: new Date("2026-01-01"),
};

function supplement(
  id: string,
  name: string,
  groupId: string | null,
  price: number | null = null,
) {
  return {
    id,
    name,
    description: "",
    active: true,
    seasonId: SEASON,
    lineageId: `lin-${id}`,
    supplementGroupId: groupId,
    createdAt: new Date(),
    updatedAt: new Date(),
    supplementGroup: null,
    prices: price === null ? [] : [{ id: `p-${id}`, seasonId: SEASON, supplementId: id, price }],
    typeLinks: groupId === null ? [{ typeId: FERM.id }] : [],
  };
}

function group(members: ReturnType<typeof supplement>[]) {
  return {
    id: "grp-1",
    name: "Espeleosocorristas",
    active: true,
    seasonId: SEASON,
    lineageId: "lin-grp",
    createdAt: new Date(),
    updatedAt: new Date(),
    supplements: members,
    groupPrices: [
      { id: "gp-1", seasonId: SEASON, groupId: "grp-1", price: 3000 },
    ],
    typeLinks: [{ typeId: FERM.id }],
  };
}

const RESCATE = supplement("sup-1", "Rescate ampliado", "grp-1");
const TARJETA = supplement("sup-2", "Tarjeta impresa", null, 500);

function renderStandaloneList(
  supplements: ReturnType<typeof supplement>[],
  groups: ReturnType<typeof group>[],
) {
  const view = render(
    <SupplementsSection
      supplements={supplements}
      supplementGroups={groups}
      licenseTypes={[FERM]}
      seasonId={SEASON}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /^Suplementos \(/ }));
  return view;
}

function renderGroup(members: ReturnType<typeof supplement>[]) {
  const theGroup = group(members);
  return render(
    <SupplementGroupRow
      group={theGroup}
      supplementGroups={[theGroup]}
      licenseTypes={[FERM]}
      seasonId={SEASON}
    />,
  );
}

describe("the one supplements section", () => {
  it("counts every supplement, the grouped ones included", () => {
    // A group is a container, not an item: nobody should add up two headings
    // to learn how many extras the club sells.
    render(
      <SupplementsSection
        supplements={[RESCATE, TARJETA]}
        supplementGroups={[group([RESCATE])]}
        licenseTypes={[FERM]}
        seasonId={SEASON}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Suplementos (2)" }),
    ).toBeTruthy();
  });

  it("shows a grouped supplement inside its group and nowhere else", () => {
    renderStandaloneList([RESCATE, TARJETA], [group([RESCATE])]);

    expect(screen.getByText("Tarjeta impresa")).toBeTruthy();
    // Once, in the group, not again as a row of its own.
    expect(screen.getAllByText("Rescate ampliado")).toHaveLength(1);
    expect(screen.getByText("Espeleosocorristas")).toBeTruthy();
  });

  it("offers both ways to create, each named", () => {
    renderStandaloneList([], []);

    expect(
      screen.getByRole("button", { name: /Nuevo suplemento/ }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /Nuevo grupo/ })).toBeTruthy();
  });

  it("says plainly when there is nothing at all", () => {
    renderStandaloneList([], []);

    expect(screen.getByText("Sin suplementos todavía.")).toBeTruthy();
  });

  it("is not empty when the only extras live in a group", () => {
    renderStandaloneList([RESCATE], [group([RESCATE])]);

    expect(screen.queryByText("Sin suplementos todavía.")).toBeNull();
  });
});

describe("a group row", () => {
  it("lists its members inside it", () => {
    renderGroup([RESCATE]);

    expect(screen.getByText("Rescate ampliado")).toBeTruthy();
  });

  it("asks for the price once, on the group and not on the member", () => {
    const { container } = renderGroup([RESCATE]);

    expect(container.querySelectorAll('input[type="number"]')).toHaveLength(1);
  });

  it("says where it is offered once, and not again per member", () => {
    renderGroup([RESCATE, supplement("sup-3", "Seguro", "grp-1")]);

    expect(screen.getAllByText("Se ofrece en")).toHaveLength(1);
    expect(screen.getAllByText("FERM")).toHaveLength(1);
  });

  it("explains the inheritance by nesting, not by a sentence about it", () => {
    renderGroup([RESCATE, supplement("sup-3", "Seguro", "grp-1")]);

    // The members are in the box; nothing spells out that they take its price
    // and its federations. A sentence saying so would mean the layout failed.
    expect(screen.getByText("Rescate ampliado")).toBeTruthy();
    expect(screen.getByText("Seguro")).toBeTruthy();
    expect(screen.queryByText(/al precio y las federativas/)).toBeNull();
  });

  it("owns up to selling nothing while it has no members", () => {
    renderGroup([]);

    expect(screen.getByText("No se vende · sin suplementos")).toBeTruthy();
  });

  it("adds into the group with the verb that says so", () => {
    renderGroup([RESCATE]);

    // "Añadir" puts one into this group; the section footer's "Nuevo" creates
    // one from scratch. Neither button has to name a place.
    expect(
      screen.getByRole("button", { name: /Añadir suplemento/ }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Nuevo suplemento/ })).toBeNull();
  });
});
