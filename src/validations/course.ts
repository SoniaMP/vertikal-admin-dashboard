import { z } from "zod";
import { personalDataSchema, SPANISH_DNI_REGEX } from "./registration";

export const courseTypeSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
});

export type CourseTypeInput = z.infer<typeof courseTypeSchema>;

const SLUG_REGEX = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;

export const courseCatalogSchema = z.object({
  title: z.string().default(""),
  slug: z
    .string()
    .regex(SLUG_REGEX, {
      message: "El slug solo puede contener letras, números y guiones (sin espacios)",
    })
    .default(""),
  courseDate: z.coerce.date().nullable().default(null),
  courseTypeId: z.string().default(""),
  maxCapacity: z
    .number()
    .int({ message: "La capacidad debe ser un número entero" })
    .positive({ message: "La capacidad debe ser mayor que 0" })
    .nullable()
    .default(null),
});

export type CourseCatalogInput = z.infer<typeof courseCatalogSchema>;

export const coursePriceEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "El nombre del precio es obligatorio" }),
  amountCents: z
    .number()
    .int({ message: "El precio debe ser un número entero (céntimos)" })
    .nonnegative({ message: "El precio no puede ser negativo" }),
});

export type CoursePriceEntryInput = z.infer<typeof coursePriceEntrySchema>;

export const coursePriceSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  amountCents: z
    .number()
    .int({ message: "El precio debe ser un número entero (céntimos)" })
    .positive({ message: "El precio debe ser mayor que 0" }),
  saleStart: z.coerce.date().nullable().optional(),
  saleEnd: z.coerce.date().nullable().optional(),
});

export type CoursePriceInput = z.infer<typeof coursePriceSchema>;

export const courseRegistrationCheckoutSchema = personalDataSchema.extend({
  courseCatalogId: z
    .string()
    .min(1, { message: "El curso es obligatorio" }),
  coursePriceId: z
    .string()
    .min(1, { message: "El precio es obligatorio" }),
  licenseType: z
    .string()
    .min(1, { message: "El tipo de licencia es obligatorio" }),
  licenseFileUrl: z
    .string()
    .min(1, { message: "La licencia es obligatoria" }),
});

export type CourseRegistrationCheckoutInput = z.infer<
  typeof courseRegistrationCheckoutSchema
>;

export const manualEnrolleeSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  lastName: z
    .string()
    .min(2, { message: "Los apellidos deben tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Introduce un email válido" }),
  coursePriceId: z
    .string()
    .min(1, { message: "El precio es obligatorio" }),
  phone: z.string().optional().default(""),
  dni: z
    .string()
    .regex(SPANISH_DNI_REGEX, { message: "DNI no válido (ej: 12345678A)" })
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().optional().default(""),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  province: z.string().optional().default(""),
});

export type ManualEnrolleeInput = z.infer<typeof manualEnrolleeSchema>;
