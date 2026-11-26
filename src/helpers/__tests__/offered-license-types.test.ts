import { describe, it, expect } from "vitest";
import { selectOfferedTypes } from "../offered-license-types";

const CLIMBING = { id: "t1", name: "Escalada", active: true };
const ALPINE = { id: "t2", name: "Alpinismo", active: true };
const RETIRED = { id: "t3", name: "Esquí", active: false };

describe("selectOfferedTypes", () => {
  it("names the federations a link list points at, sorted", () => {
    const offered = selectOfferedTypes(["t1", "t2"], [CLIMBING, ALPINE]);

    expect(offered.map((type) => type.name)).toEqual([
      "Alpinismo",
      "Escalada",
    ]);
  });

  it("keeps a retired federation on the list, marked", () => {
    const offered = selectOfferedTypes(["t3"], [CLIMBING, RETIRED]);

    expect(offered).toEqual([
      { id: "t3", name: "Esquí", isRetired: true },
    ]);
  });

  it("drops an id with no federation behind it", () => {
    const offered = selectOfferedTypes(["t1", "gone"], [CLIMBING]);

    expect(offered.map((type) => type.id)).toEqual(["t1"]);
  });

  it("returns nothing for an extra offered nowhere", () => {
    expect(selectOfferedTypes([], [CLIMBING])).toEqual([]);
  });
});
