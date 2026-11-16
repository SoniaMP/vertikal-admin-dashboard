export const dynamic = "force-dynamic";

import { getMembershipFee } from "@/lib/settings";
import { fetchLicenseCatalog } from "@/lib/license-catalog";
import { RenewalFlow } from "@/components/registration/renewal-flow";

export const metadata = {
  title: "Renovación - Club Vertikal",
  description: "Renueva tu registro de socio en el Club Vertikal",
};

export default async function RenovacionPage() {
  const [licenseTypes, membershipFee] = await Promise.all([
    fetchLicenseCatalog(),
    getMembershipFee(),
  ]);

  return (
    <RenewalFlow licenseTypes={licenseTypes} membershipFee={membershipFee} />
  );
}
