export type PayBlocker = {
  message: string;
  /** What the member has to go and fix before paying. */
  target: "license" | "consent";
};

type PayState = {
  /** False when the summary could not price the chosen license. */
  hasTotal: boolean;
  hasAcceptedPrivacy: boolean;
};

/**
 * Why "Proceder al pago" cannot go through yet, or null when it can.
 *
 * The button stays enabled and says this on tap: a primary action that greys
 * out without a reason reads as a broken page, so the member taps it again and
 * gives up. The missing total comes first because it is the one the member
 * cannot fix from this screen.
 */
export function payBlockReason(state: PayState): PayBlocker | null {
  if (!state.hasTotal) {
    return {
      target: "license",
      message:
        "No podemos calcular el total de esta licencia, así que tampoco te podemos cobrar. Vuelve al paso de licencia y elige otra modalidad o categoría.",
    };
  }

  if (!state.hasAcceptedPrivacy) {
    return {
      target: "consent",
      message:
        "Marca la casilla de la Política de Privacidad para poder continuar.",
    };
  }

  return null;
}
