"use client";

import { useCallback, useState } from "react";

export type PrivacyConsent = {
  isChecked: boolean;
  hasOpenedPolicy: boolean;
  accept: (isChecked: boolean) => void;
  markPolicyOpened: () => void;
};

/**
 * The member's answer to the RGPD box, held by the wizard rather than by the
 * summary that draws it.
 *
 * The summary mounts only on its own step, so until now a member who went back
 * to fix a typo returned to a box that had quietly cleared itself. Holding both
 * halves here gives them one lifetime: what was read stays read and what was
 * accepted stays accepted, for as long as the form is on screen.
 *
 * `hasOpenedPolicy` never returns to false. Closing the dialog does not unread
 * the text, and reopening it must not re-lock a box the member already ticked.
 */
export function usePrivacyConsent(): PrivacyConsent {
  const [isChecked, setIsChecked] = useState(false);
  const [hasOpenedPolicy, setHasOpenedPolicy] = useState(false);

  const accept = useCallback((checked: boolean) => {
    setIsChecked(checked);
  }, []);

  const markPolicyOpened = useCallback(() => {
    setHasOpenedPolicy(true);
  }, []);

  return { isChecked, hasOpenedPolicy, accept, markPolicyOpened };
}
