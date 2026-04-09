"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthSession, type ActionResult } from "@/lib/actions";

export async function deleteEnrollee(
  registrationId: string,
  courseId: string,
): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "No autorizado" };

  const ownershipError = await checkEnrolleeAccess(session, courseId);
  if (ownershipError) return ownershipError;

  const registration = await prisma.courseRegistration.findUnique({
    where: { id: registrationId },
    select: { courseCatalogId: true },
  });

  if (!registration) {
    return { success: false, error: "Inscripción no encontrada" };
  }

  if (registration.courseCatalogId !== courseId) {
    return { success: false, error: "No autorizado" };
  }

  await prisma.courseRegistration.delete({
    where: { id: registrationId },
  });

  revalidatePath(`/admin/cursos/${courseId}`);
  return { success: true };
}

type AuthSession = NonNullable<Awaited<ReturnType<typeof getAuthSession>>>;

async function checkEnrolleeAccess(
  session: AuthSession,
  courseId: string,
): Promise<ActionResult | null> {
  if (session.user.role === "ADMIN") return null;

  if (session.user.role !== "INSTRUCTOR") {
    return { success: false, error: "No autorizado" };
  }

  const course = await prisma.courseCatalog.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  if (course?.instructorId !== session.user.id) {
    return { success: false, error: "No autorizado" };
  }

  return null;
}
