import type { MembershipRow } from "./memberships-table";

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Members who federate elsewhere have no club license to name, so the row
 * shows the federation they typed in instead of the club catalog entry.
 */
export function licenseLabel(m: MembershipRow): string {
  if (!m.hasClubLicense) {
    return m.externalLicenseLabel?.trim() || "Licencia externa";
  }
  const parts = [m.type?.name, m.subtype?.name].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : "Sin licencia";
}
