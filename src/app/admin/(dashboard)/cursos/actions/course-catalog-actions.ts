"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  courseCatalogSchema,
  coursePriceEntrySchema,
} from "@/validations/course";
import {
  getAuthSession,
  requireAdmin,
  type ActionResult,
} from "@/lib/actions";

const pricesArraySchema = z.array(coursePriceEntrySchema);

function parsePricesJson(raw: FormDataEntryValue | null) {
  if (!raw || typeof raw !== "string") return [];
  try {
    const result = pricesArraySchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function parseCourseFormData(formData: FormData) {
  return courseCatalogSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    courseDate: formData.get("courseDate") || undefined,
    courseTypeId: formData.get("courseTypeId"),
    maxCapacity: toNumberOrNull(formData.get("maxCapacity")),
  });
}

export async function createCourse(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "No autorizado" };

  const parsed = parseCourseFormData(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const prices = parsePricesJson(formData.get("pricesJson"));
  const { courseDate, maxCapacity, ...rest } = parsed.data;
  const isInstructor = session.user.role === "INSTRUCTOR";

  const instructorId = isInstructor
    ? session.user.id
    : (formData.get("instructorId") as string) || null;

  await prisma.courseCatalog.create({
    data: {
      ...rest,
      courseDate: courseDate ?? new Date(),
      maxCapacity: maxCapacity ?? 0,
      instructorId,
      ...(isInstructor && { status: "DRAFT" }),
      prices: {
        create: prices.map((p) => ({
          name: p.name,
          amountCents: p.amountCents,
        })),
      },
    },
  });

  revalidatePath("/admin/cursos");
  return { success: true };
}

export async function updateCourse(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: "No autorizado" };

  const ownershipError = await checkInstructorOwnership(session, id);
  if (ownershipError) return ownershipError;

  const parsed = parseCourseFormData(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const prices = parsePricesJson(formData.get("pricesJson"));
  const { courseDate, maxCapacity, ...rest } = parsed.data;
  const isAdmin = session.user.role === "ADMIN";

  const instructorIdRaw = formData.get("instructorId") as string | null;
  const instructorUpdate = isAdmin
    ? { instructorId: instructorIdRaw || null }
    : {};

  await prisma.$transaction(async (tx) => {
    await tx.courseCatalog.update({
      where: { id },
      data: {
        ...rest,
        ...instructorUpdate,
        ...(courseDate !== null && { courseDate }),
        ...(maxCapacity !== null && { maxCapacity }),
      },
    });

    await syncCoursePrices(tx, id, prices);
  });

  revalidatePath("/admin/cursos");
  return { success: true };
}

export async function setCourseStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const validStatuses = ["DRAFT", "ACTIVE", "INACTIVE"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Estado no válido" };
  }

  await prisma.courseCatalog.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/cursos");
  return { success: true };
}

export async function softDeleteCourse(id: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  await prisma.courseCatalog.update({
    where: { id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });
  revalidatePath("/admin/cursos");
  return { success: true };
}

// ── Helpers ──

type AuthSession = NonNullable<Awaited<ReturnType<typeof getAuthSession>>>;

async function checkInstructorOwnership(
  session: AuthSession,
  courseId: string,
): Promise<ActionResult | null> {
  if (session.user.role !== "INSTRUCTOR") return null;

  const course = await prisma.courseCatalog.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  if (course?.instructorId !== session.user.id) {
    return { success: false, error: "No autorizado" };
  }

  return null;
}

type PriceEntry = z.infer<typeof coursePriceEntrySchema>;
type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function syncCoursePrices(
  tx: TxClient,
  courseCatalogId: string,
  incoming: PriceEntry[],
) {
  const existing = await tx.coursePrice.findMany({
    where: { courseCatalogId },
    select: { id: true },
  });

  const incomingIds = new Set(incoming.filter((p) => p.id).map((p) => p.id));
  const toDelete = existing.filter((e) => !incomingIds.has(e.id));

  if (toDelete.length > 0) {
    await tx.coursePrice.deleteMany({
      where: { id: { in: toDelete.map((d) => d.id) } },
    });
  }

  for (const price of incoming) {
    if (price.id) {
      await tx.coursePrice.update({
        where: { id: price.id },
        data: { name: price.name, amountCents: price.amountCents },
      });
    } else {
      await tx.coursePrice.create({
        data: {
          courseCatalogId,
          name: price.name,
          amountCents: price.amountCents,
        },
      });
    }
  }
}

function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (!value || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}
