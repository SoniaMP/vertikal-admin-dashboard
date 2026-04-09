import { z } from "zod";

const ROLE_NAMES = ["ADMIN", "INSTRUCTOR"] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  roleName: z.enum(ROLE_NAMES, { message: "Rol no válido" }),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email no válido"),
  password: z
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(
      z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .optional(),
    ),
  roleName: z.enum(ROLE_NAMES, { message: "Rol no válido" }),
});
