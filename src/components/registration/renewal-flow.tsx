"use client";

import { useState } from "react";
import { RenewalLookup } from "./renewal-lookup";
import { RegistrationWizard } from "./registration-wizard";
import { RegistrationHeader } from "./registration-header";
import { RENEWAL_COPY } from "@/helpers/renewal-copy";
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

  // The header lives here, not on the page: the wizard needs it inside its
  // content column, so a copy on the page would print the title twice.
  const header = <RegistrationHeader {...RENEWAL_COPY} />;

  if (!prefill && !isFillingByHand) {
    return (
      <>
        {/* The same gap the wizard leaves under its own header. */}
        <div className="mb-10">{header}</div>
        <RenewalLookup
          onVerified={setPrefill}
          onSkip={() => setIsFillingByHand(true)}
        />
      </>
    );
  }

  // The way out rides in the wizard's own button row, beside "Anterior".
  return (
    <RegistrationWizard
      licenseTypes={licenseTypes}
      membershipFee={membershipFee}
      mode="renewal"
      defaultValues={prefill?.member}
      previousLicense={prefill?.previousLicense ?? null}
      header={header}
    />
  );
}
