"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RenewalLookup } from "./renewal-lookup";
import { RegistrationWizard } from "./registration-wizard";
import { RegistrationHeader } from "./registration-header";
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

  // The way out sits below the form and says what it does. The old link said
  // "Volver atrás" at the top of every step while actually restarting the
  // whole thing, which is the opposite of what "back" means next to the
  // wizard's own "Anterior" button.
  return (
    <>
      <RegistrationWizard
        licenseTypes={licenseTypes}
        membershipFee={membershipFee}
        mode="renewal"
        defaultValues={prefill?.member}
        previousLicense={prefill?.previousLicense ?? null}
        header={<RegistrationHeader />}
      />

      <div className="mt-4 text-center">
        <Button variant="link" asChild className="text-muted-foreground">
          <Link href="/registro">Empezar de nuevo</Link>
        </Button>
      </div>
    </>
  );
}
