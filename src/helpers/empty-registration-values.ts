import type { DefaultValues } from "react-hook-form";
import type { RegistrationInput } from "@/validations/registration";

// `hasClubLicense` is deliberately absent: step 2 must start with neither card
// selected so the member makes an explicit choice.
export const EMPTY_REGISTRATION_VALUES: DefaultValues<RegistrationInput> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dni: "",
  dateOfBirth: "",
  sex: "",
  address: "",
  city: "",
  postalCode: "",
  province: "",
  typeId: "",
  subtypeId: "",
  categoryId: "",
  supplementIds: [],
  externalLicenseLabel: "",
  externalLicenseFileUrl: "",
};
