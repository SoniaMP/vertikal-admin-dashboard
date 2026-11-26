type LicenseTypeOption = {
  id: string;
  name: string;
  active: boolean;
};

export type OfferedType = {
  id: string;
  name: string;
  isRetired: boolean;
};

/**
 * The federations a link list points at, named and sorted for the panel.
 *
 * A retired federation stays on the list, marked: the link is still there and
 * showing it is what keeps "I configured this and it does not show up" from
 * being a mystery. Reactivating the federation brings the extra back with it.
 *
 * An id with no federation behind it is dropped — it means the row was deleted
 * while the page was open, and the cascade has already taken the link with it.
 */
export function selectOfferedTypes(
  linkedTypeIds: string[],
  types: LicenseTypeOption[],
): OfferedType[] {
  const typeById = new Map(types.map((type) => [type.id, type]));

  return linkedTypeIds
    .map((typeId) => typeById.get(typeId))
    .filter((type): type is LicenseTypeOption => type !== undefined)
    .map((type) => ({
      id: type.id,
      name: type.name,
      isRetired: !type.active,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
