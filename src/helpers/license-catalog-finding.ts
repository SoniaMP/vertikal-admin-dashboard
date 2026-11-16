type LicenseTypeSummary = {
  name: string;
  /** How many offerings this type has priced in the season being shown. */
  offeringCount: number;
};

/**
 * The one line under the licences title: whether every modality can actually
 * be bought this season. A type with no priced offering is a dead end in the
 * public flow — the member picks it and finds nothing to choose.
 */
export function formatLicenseCatalogFinding(
  types: LicenseTypeSummary[],
  seasonName: string,
): string {
  if (types.length === 0) {
    return `No hay modalidades federativas configuradas.`;
  }

  const unpriced = types.filter((type) => type.offeringCount === 0);

  if (unpriced.length === 0) {
    const all =
      types.length === 1
        ? "La modalidad tiene precio"
        : `Las ${types.length} modalidades tienen precio`;
    return `${all} en la temporada ${seasonName}.`;
  }

  const names = unpriced.map((type) => `«${type.name}»`);
  const verb = unpriced.length === 1 ? "no se puede" : "no se pueden";

  return `${types.length - unpriced.length} de ${types.length} modalidades tienen precio en ${seasonName}: ${joinWithAnd(names)} ${verb} contratar todavía.`;
}

function joinWithAnd(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
}
