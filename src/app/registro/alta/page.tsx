export const dynamic = "force-dynamic";

import { getMembershipFee } from "@/lib/settings";
import { fetchLicenseCatalog } from "@/lib/license-catalog";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { RegistrationHeader } from "@/components/registration/registration-header";

export const metadata = {
  title: "Alta nueva - Club Vertikal",
  description: "Regístrate como nuevo socio del Club Vertikal",
};

export default async function AltaPage() {
  const [licenseTypes, membershipFee] = await Promise.all([
    fetchLicenseCatalog(),
    getMembershipFee(),
  ]);

  return (
    <RegistrationWizard
      licenseTypes={licenseTypes}
      membershipFee={membershipFee}
      header={<RegistrationHeader />}
    />
  );
}
