/**
 * The price a form submitted, in cents, or null when it set none.
 *
 * The field is in euros because that is what an admin types; the database
 * keeps cents, so the conversion belongs here rather than in each action. An
 * empty field is an answer too — the extra is left without a price this
 * season, and the panel says so instead of inventing a figure.
 */
export function readPriceCents(formData: FormData): number | null {
  const raw = formData.get("price");
  if (raw === null) return null;

  const euros = String(raw).trim();
  if (euros === "") return null;

  return Math.round(parseFloat(euros) * 100);
}
