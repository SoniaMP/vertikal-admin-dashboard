export const dynamic = "force-dynamic";

import { getActiveSeason, getMembershipFee } from "@/lib/settings";
import { fetchLicenseCatalog } from "@/lib/license-catalog";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { RegistrationHeader } from "@/components/registration/registration-header";
import { RegistrationClosed } from "@/components/registration/registration-closed";

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

  // Nothing on offer means the season is not ready to take anyone, whether
  // or not they were going to federate through the club.
  if (licenseTypes.length === 0) {
    return <RegistrationClosed year={season.year} />;
  }

  return (
    <RegistrationWizard
      licenseTypes={licenseTypes}
      membershipFee={membershipFee}
      header={<RegistrationHeader />}
    />
  );
}
