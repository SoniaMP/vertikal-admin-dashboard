import { History } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PreviousLicense } from "@/lib/renewal-prefill";

type PreviousLicenseNoteProps = {
  previousLicense: PreviousLicense;
};

/** Reminds a renewing member what they had, and nothing more. */
export function PreviousLicenseNote({
  previousLicense,
}: PreviousLicenseNoteProps) {
  return (
    <Alert>
      <History />
      <AlertDescription>
        En {previousLicense.seasonName} tenías esta licencia:{" "}
        <strong>{previousLicense.label}</strong>
      </AlertDescription>
    </Alert>
  );
}
