"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthSession, type ActionResult } from "@/lib/actions";
import { getCourseAvailableSpots } from "@/lib/course-queries";
import { manualEnrolleeSchema } from "@/validations/course";

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

export async function addEnrollee(
  courseId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "No autorizado" };

  const ownershipError = await checkEnrolleeAccess(session, courseId);
  if (ownershipError) return ownershipError;

  const parsed = manualEnrolleeSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    coursePriceId: formData.get("coursePriceId"),
    phone: formData.get("phone") || "",
    dni: formData.get("dni") || "",
    dateOfBirth: formData.get("dateOfBirth") || "",
    address: formData.get("address") || "",
    city: formData.get("city") || "",
    postalCode: formData.get("postalCode") || "",
    province: formData.get("province") || "",
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const spots = await getCourseAvailableSpots(courseId);
  if (spots <= 0) {
    return { success: false, error: "El curso está completo" };
  }

  const price = await prisma.coursePrice.findUnique({
    where: { id: parsed.data.coursePriceId },
    select: { courseCatalogId: true },
  });

  if (!price || price.courseCatalogId !== courseId) {
    return { success: false, error: "Precio no válido para este curso" };
  }

  const { coursePriceId, dateOfBirth, dni, ...rest } = parsed.data;

  await prisma.courseRegistration.create({
    data: {
      ...rest,
      courseCatalogId: courseId,
      coursePriceId,
      dni: dni || null,
      dateOfBirth: dateOfBirth || null,
      paymentStatus: "MANUAL",
    },
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
