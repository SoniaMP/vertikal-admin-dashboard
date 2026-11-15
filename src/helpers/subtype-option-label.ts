/** Letters and digits only, unaccented, so "BÁSICA A" and "basicaa" match. */
function toComparable(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * How a license subtype reads in the picker. The `description` column holds a
 * slug for some subtypes ("BÁSICA A" / "basicaa"), and showing it turns a
 * clear option into "BÁSICA A - basicaa". It is only appended when it actually
 * says something the name does not.
 */
export function subtypeOptionLabel(subtype: {
  name: string;
  description?: string | null;
}): string {
  const description = subtype.description?.trim();
  if (!description) return subtype.name;
  if (toComparable(description) === toComparable(subtype.name)) {
    return subtype.name;
  }
  return `${subtype.name} - ${description}`;
}
