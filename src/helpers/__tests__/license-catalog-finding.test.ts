import { describe, expect, it } from "vitest";
import { formatLicenseCatalogFinding } from "../license-catalog-finding";

describe("formatLicenseCatalogFinding", () => {
  it("names the modalities a member cannot buy yet", () => {
    expect(
      formatLicenseCatalogFinding(
        [
          { name: "Escalada", offeringCount: 4 },
          { name: "Espeleología", offeringCount: 0 },
          { name: "Senderismo", offeringCount: 2 },
        ],
        "2026",
      ),
    ).toBe(
      "2 de 3 modalidades tienen precio en 2026: «Espeleología» no se puede contratar todavía.",
    );
  });

  it("lists several dead ends with a final y", () => {
    expect(
      formatLicenseCatalogFinding(
        [
          { name: "Escalada", offeringCount: 1 },
          { name: "Espeleología", offeringCount: 0 },
          { name: "Barrancos", offeringCount: 0 },
        ],
        "2026",
      ),
    ).toBe(
      "1 de 3 modalidades tienen precio en 2026: «Espeleología» y «Barrancos» no se pueden contratar todavía.",
    );
  });

  it("says plainly when the season is fully priced", () => {
    expect(
      formatLicenseCatalogFinding(
        [
          { name: "Escalada", offeringCount: 2 },
          { name: "Espeleología", offeringCount: 3 },
        ],
        "2026",
      ),
    ).toBe("Las 2 modalidades tienen precio en la temporada 2026.");
  });

  it("does not count modalities that do not exist", () => {
    expect(formatLicenseCatalogFinding([], "2026")).toBe(
      "No hay modalidades federativas configuradas.",
    );
  });
});
