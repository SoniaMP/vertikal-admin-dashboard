import { z } from "zod";
import { normalizeDni } from "@/helpers/dni";

const DNI_PATTERN = /^[A-Z0-9]{5,20}$/;
const DNI_MESSAGE = "Documento no válido (5-20 caracteres alfanuméricos)";
const SPANISH_PHONE_REGEX = /^(\+34)?[6-9]\d{8}$/;
const SPANISH_POSTAL_CODE_REGEX = /^\d{5}$/;

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
  email: z.string().email({ message: "Introduce un email válido" }),
  phone: z
    .string()
    .regex(SPANISH_PHONE_REGEX, {
      message: "Introduce un teléfono válido (ej: 612345678)",
    }),
  dni: dniSchema,
  dateOfBirth: z
    .string()
    .min(1, { message: "La fecha de nacimiento es obligatoria" }),
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
  typeId: z
    .string()
    .min(1, { message: "Selecciona un tipo de licencia" }),
  subtypeId: z
    .string()
    .min(1, { message: "Selecciona un subtipo de licencia" }),
  categoryId: z
    .string()
    .min(1, { message: "Selecciona una categoría" }),
  supplementIds: z.array(z.string()),
});

export const registrationSchema = personalDataSchema.merge(
  licenseSelectionSchema,
);

export type PersonalDataInput = z.infer<typeof personalDataSchema>;
export type LicenseSelectionInput = z.infer<typeof licenseSelectionSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
