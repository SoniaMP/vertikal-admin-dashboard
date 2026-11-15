"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RenewalLookup } from "./renewal-lookup";
import { RegistrationWizard } from "./registration-wizard";
import type { RenewalPrefill } from "@/lib/renewal-prefill";
import type { LicenseCatalogType } from "@/types";

type RenewalFlowProps = {
  licenseTypes: LicenseCatalogType[];
  membershipFee: number;
};

export function RenewalFlow({
  licenseTypes,
  membershipFee,
}: RenewalFlowProps) {
  const [prefill, setPrefill] = useState<RenewalPrefill | null>(null);
  const [isFillingByHand, setIsFillingByHand] = useState(false);

  if (!prefill && !isFillingByHand) {
    return (
      <RenewalLookup
        onVerified={setPrefill}
        onSkip={() => setIsFillingByHand(true)}
      />
    );
  }

  // No "Volver atrás" link above the wizard any more. It used to throw away
  // every field the member had typed, and now it would also throw away a
  // verified session: getting back in costs another code, and only three are
  // sent per hour. "Anterior" inside the wizard is the way back.
  return (
    <Card>
      <CardContent>
        <RegistrationWizard
          licenseTypes={licenseTypes}
          membershipFee={membershipFee}
          mode="renewal"
          defaultValues={prefill?.member}
          previousLicense={prefill?.previousLicense ?? null}
        />
      </CardContent>
    </Card>
  );
}
