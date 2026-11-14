import { z } from "zod";
import { normalizeDni } from "@/helpers/dni";
import { birthDateSchema } from "./birth-date";

const DNI_PATTERN = /^[A-Z0-9]{5,20}$/;
const DNI_MESSAGE = "Documento no válido (5-20 caracteres alfanuméricos)";
const SPANISH_PHONE_REGEX = /^(\+34)?[6-9]\d{8}$/;
const SPANISH_POSTAL_CODE_REGEX = /^\d{5}$/;

// Only a path this app produced is accepted. The value is rendered as a link in
// the admin panel, so letting a registrant post an arbitrary URL would turn the
// members list into a one-click phishing vector.
const EXTERNAL_LICENSE_URL_PATTERN =
  /^\/api\/uploads\/licenses\/[a-f0-9-]+\.pdf$/;

export const dniSchema = z
  .string()
  .transform(normalizeDni)
  .pipe(z.string().regex(DNI_PATTERN, { message: DNI_MESSAGE }));

export const personalDataSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  lastName: z
    .string()
    .min(2, { message: "Los apellidos deben tener al menos 2 caracteres" }),
  // Trimmed before validating: a pasted address drags a trailing space in,
  // and rejecting it shows an error pointing at something the member cannot
  // see. The trimmed value is the one that gets stored.
  email: z.string().trim().email({ message: "Introduce un email válido" }),
  phone: z
    .string()
    .regex(SPANISH_PHONE_REGEX, {
      message: "Introduce un teléfono válido (ej: 612345678)",
    }),
  dni: dniSchema,
  dateOfBirth: birthDateSchema,
  sex: z
    .string()
    .refine((v) => ["M", "F"].includes(v), { message: "Selecciona el sexo" }),
  address: z
    .string()
    .min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  city: z
    .string()
    .min(2, { message: "La ciudad debe tener al menos 2 caracteres" }),
  postalCode: z
    .string()
    .regex(SPANISH_POSTAL_CODE_REGEX, {
      message: "Introduce un código postal válido (5 dígitos)",
    }),
  province: z
    .string()
    .min(2, { message: "La provincia debe tener al menos 2 caracteres" }),
});

export const licenseSelectionSchema = z.object({
  hasClubLicense: z.boolean({
    message: "Elige cómo quieres tramitar tu licencia",
  }),
  typeId: z.string(),
  subtypeId: z.string(),
  categoryId: z.string(),
  supplementIds: z.array(z.string()),
  externalLicenseLabel: z.string(),
  externalLicenseFileUrl: z.string(),
});

type LicenseSelection = z.infer<typeof licenseSelectionSchema>;

// Field names each wizard step validates before letting the member advance.
// They are listed explicitly because the two license branches share one flat
// object, so the step cannot derive them from the schema's own keys.
export const MEMBERSHIP_MODE_FIELDS = ["hasClubLicense"] as const;

export const CLUB_LICENSE_FIELDS = [
  "typeId",
  "subtypeId",
  "categoryId",
  "supplementIds",
] as const;

export const EXTERNAL_LICENSE_FIELDS = [
  "externalLicenseLabel",
  "externalLicenseFileUrl",
] as const;

function addRequired(
  ctx: z.RefinementCtx,
  field: keyof LicenseSelection,
  message: string,
) {
  ctx.addIssue({ code: "custom", path: [field], message });
}

/**
 * A membership either buys its federation license through the club or proves an
 * in-force one obtained elsewhere. Each branch requires a different field set,
 * so the fields belonging to the branch not taken are simply ignored.
 */
function validateLicenseBranch(data: LicenseSelection, ctx: z.RefinementCtx) {
  if (data.hasClubLicense) {
    if (!data.typeId) {
      addRequired(ctx, "typeId", "Selecciona un tipo de licencia");
    }
    if (!data.subtypeId) {
      addRequired(ctx, "subtypeId", "Selecciona un subtipo de licencia");
    }
    if (!data.categoryId) {
      addRequired(ctx, "categoryId", "Selecciona una categoría");
    }
    return;
  }

  if (data.externalLicenseLabel.trim().length < 2) {
    addRequired(
      ctx,
      "externalLicenseLabel",
      "Indica la federación y el tipo de licencia",
    );
  }
  if (!EXTERNAL_LICENSE_URL_PATTERN.test(data.externalLicenseFileUrl)) {
    addRequired(ctx, "externalLicenseFileUrl", "Sube el PDF de tu licencia");
  }
}

export const registrationSchema = personalDataSchema
  .extend(licenseSelectionSchema.shape)
  .superRefine(validateLicenseBranch);

export type PersonalDataInput = z.infer<typeof personalDataSchema>;
export type LicenseSelectionInput = z.infer<typeof licenseSelectionSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
