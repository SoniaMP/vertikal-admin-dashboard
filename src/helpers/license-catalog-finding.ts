type LicenseTypeSummary = {
  name: string;
  /** How many offerings this type has priced in the season being shown. */
  offeringCount: number;
};

/**
 * The one line under the licences title, or null when there is nothing to say.
 *
 * It only speaks when something needs doing: a type with no priced offering is
 * a dead end in the public flow — the member picks it and finds nothing to
 * choose. Confirming that everything is fine is noise under a title, and a
 * line that is always there stops being read by the time it matters.
 */
export function formatLicenseCatalogFinding(
  types: LicenseTypeSummary[],
  seasonName: string,
): string | null {
  if (types.length === 0) {
    return `No hay modalidades federativas configuradas.`;
  }

  const unpriced = types.filter((type) => type.offeringCount === 0);

  if (unpriced.length === 0) return null;

  const names = unpriced.map((type) => `«${type.name}»`);
  const verb = unpriced.length === 1 ? "no se puede" : "no se pueden";

  return `${types.length - unpriced.length} de ${types.length} modalidades tienen precio en ${seasonName}: ${joinWithAnd(names)} ${verb} contratar todavía.`;
}

function joinWithAnd(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
}
