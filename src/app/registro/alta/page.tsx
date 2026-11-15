export const dynamic = "force-dynamic";

import { getMembershipFee } from "@/lib/settings";
import { fetchLicenseCatalog } from "@/lib/license-catalog";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { RegistrationHeader } from "@/components/registration/registration-header";
import { Card, CardContent } from "@/components/ui/card";

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
    <>
      <RegistrationHeader />
      <Card>
        <CardContent>
          <RegistrationWizard
            licenseTypes={licenseTypes}
            membershipFee={membershipFee}
          />
        </CardContent>
      </Card>
    </>
  );
}
