import { FederatedToggle } from "./federated-toggle";
import { ExternalLicenseBadge } from "./external-license-badge";
import type { MembershipRow } from "./memberships-table";

type Props = { membership: MembershipRow };

/**
 * The federation column answers "is this member federated?", which two
 * different fields decide. For a club license it is the admin toggle; for a
 * license obtained elsewhere it is whether we checked the PDF they uploaded.
 */
export function FederationCell({ membership: m }: Props) {
  if (!m.hasClubLicense) {
    return (
      <ExternalLicenseBadge
        membershipId={m.id}
        fileUrl={m.externalLicenseFileUrl}
        verifiedAt={m.externalLicenseVerifiedAt}
      />
    );
  }
  return <FederatedToggle membershipId={m.id} isFederated={m.isFederated} />;
}
