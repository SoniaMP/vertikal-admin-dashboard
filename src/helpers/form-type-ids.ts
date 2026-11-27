/**
 * The federations a form ticked, as ids.
 *
 * The checklist submits one hidden field per selection, so an empty answer
 * arrives as no fields at all rather than as an empty string. Blank values are
 * dropped anyway: a browser that sends one must not be read as a link to a
 * federation with no id.
 */
export function readTypeIds(formData: FormData): string[] {
  return formData
    .getAll("typeIds")
    .map(String)
    .filter((id) => id.length > 0);
}
