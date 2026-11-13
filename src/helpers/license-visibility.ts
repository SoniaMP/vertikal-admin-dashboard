export type LicenseVisibility = "draft" | "published" | "retired";

type PublishableLicense = {
  active: boolean;
  publishedAt: Date | null;
};

/**
 * A row that has never been published is a draft whatever `active` says.
 * `active` only decides whether an already published row is still on offer,
 * so a federation retired mid-season reads as "retired", not as a draft.
 */
export function resolveLicenseVisibility(
  license: PublishableLicense,
): LicenseVisibility {
  if (license.publishedAt === null) return "draft";
  return license.active ? "published" : "retired";
}
