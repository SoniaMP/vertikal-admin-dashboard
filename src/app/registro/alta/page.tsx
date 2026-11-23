export const dynamic = "force-dynamic";

import { getActiveSeason, getMembershipFee } from "@/lib/settings";
import { fetchLicenseCatalog } from "@/lib/license-catalog";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { RegistrationHeader } from "@/components/registration/registration-header";

export const metadata = {
  title: "Alta nueva - Club Vertikal",
  description: "Regístrate como nuevo socio del Club Vertikal",
};

export default async function AltaPage() {
  const [licenseTypes, membershipFee, season] = await Promise.all([
    fetchLicenseCatalog(),
    getMembershipFee(),
    getActiveSeason(),
  ]);

  return (
    <RegistrationWizard
      licenseTypes={licenseTypes}
      seasonYear={season.year}
      membershipFee={membershipFee}
      header={<RegistrationHeader />}
    />
  );
}
