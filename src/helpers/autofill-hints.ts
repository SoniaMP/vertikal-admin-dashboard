export type AutofillHints = {
  /** The standard token, or "off" where no token describes the field. */
  autoComplete: string;
  inputMode?: "numeric";
};

/**
 * What the browser needs to fill a personal-data field on its own.
 *
 * Both public forms ask for the same eleven things, so the tokens live here
 * rather than at each call site: a member filling in the course form and a
 * member filling in the registration form get the same help, and the two
 * cannot drift apart.
 *
 * A Spanish identity document has no standard token, so it is explicitly
 * "off": left unset, browsers guess and offer something else entirely.
 */
const HINTS: Record<string, AutofillHints> = {
  firstName: { autoComplete: "given-name" },
  lastName: { autoComplete: "family-name" },
  dni: { autoComplete: "off" },
  dateOfBirth: { autoComplete: "bday" },
  email: { autoComplete: "email" },
  phone: { autoComplete: "tel" },
  address: { autoComplete: "street-address" },
  city: { autoComplete: "address-level2" },
  // Spain's provinces are the administrative level above the town.
  province: { autoComplete: "address-level1" },
  postalCode: { autoComplete: "postal-code", inputMode: "numeric" },
};

export function autofillHints(field: string): AutofillHints {
  return HINTS[field] ?? { autoComplete: "off" };
}
