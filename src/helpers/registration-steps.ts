export type RegistrationStep = { number: number; label: string };

/**
 * The wizard's steps. Shared with the loading skeleton so the two cannot
 * disagree about how many circles the member is about to see.
 *
 * Step 3 changes name but never disappears: a member who federates elsewhere
 * still has to tell us about that license.
 */
export function buildRegistrationSteps(
  hasClubLicense: boolean | undefined,
): RegistrationStep[] {
  return [
    { number: 1, label: "Datos personales" },
    { number: 2, label: "Licencia" },
    { number: 3, label: hasClubLicense === false ? "Tu licencia" : "Federativa" },
    { number: 4, label: "Resumen" },
  ];
}
