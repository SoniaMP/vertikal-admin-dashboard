export type PayBlocker = {
  message: string;
  /** What the member has to go and fix before paying. */
  target: "license" | "policy" | "consent";
};

type PayState = {
  /** False when the summary could not price the chosen license. */
  hasTotal: boolean;
  /** False until the member has opened the privacy policy at least once. */
  hasOpenedPolicy: boolean;
  hasAcceptedPrivacy: boolean;
};

const CONSENT_MESSAGE =
  "Debes aceptar la Política de Privacidad para continuar.";

/**
 * Why "Proceder al pago" cannot go through yet, or null when it can.
 *
 * The button stays enabled and says this on tap: a primary action that greys
 * out without a reason reads as a broken page, so the member taps it again and
 * gives up. The missing total comes first because it is the one the member
 * cannot fix from this screen.
 *
 * The unread policy and the unticked box say the same sentence on purpose, but
 * they are separate targets because the box is disabled until the policy has
 * been opened, and `focus()` on a disabled control does nothing at all. Sending
 * the member to the link is what keeps the message from being a dead end.
 */
export function payBlockReason(state: PayState): PayBlocker | null {
  if (!state.hasTotal) {
    return {
      target: "license",
      message:
        "No podemos calcular el total de esta licencia, así que tampoco te podemos cobrar. Vuelve al paso de licencia y elige otra modalidad o categoría.",
    };
  }

  if (!state.hasOpenedPolicy) {
    return { target: "policy", message: CONSENT_MESSAGE };
  }

  if (!state.hasAcceptedPrivacy) {
    return { target: "consent", message: CONSENT_MESSAGE };
  }

  return null;
}
