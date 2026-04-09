"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

type LoginState = { error: string };

async function getRedirectForUser(email: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });
  const role = user?.roles[0]?.role.name;
  return role === "INSTRUCTOR" ? "/admin/cursos" : "/admin";
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;

  try {
    const redirectTo = await getRedirectForUser(email);
    await signIn("credentials", {
      email,
      password: formData.get("password") as string,
      redirectTo,
    });
    return { error: "" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos" };
    }
    // signIn throws a NEXT_REDIRECT on success — rethrow it
    throw error;
  }
}
