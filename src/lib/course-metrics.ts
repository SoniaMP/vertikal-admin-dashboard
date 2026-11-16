import { prisma } from "@/lib/prisma";

export type CourseMetrics = {
  /** Registrations that hold a place: paid online or taken in person. */
  enrolled: number;
  /** Started but not paid. These do not hold a place until they are. */
  pending: number;
  /** In euros, summed from what each enrolled person was charged. */
  revenue: number;
  capacity: number;
  free: number;
};

const HOLDS_A_PLACE = ["COMPLETED", "MANUAL"];

export async function fetchCourseMetrics(
  courseId: string,
  capacity: number,
): Promise<CourseMetrics> {
  const [enrolledRows, pending] = await Promise.all([
    prisma.courseRegistration.findMany({
      where: { courseCatalogId: courseId, paymentStatus: { in: HOLDS_A_PLACE } },
      select: { coursePrice: { select: { amountCents: true } } },
    }),
    prisma.courseRegistration.count({
      where: { courseCatalogId: courseId, paymentStatus: "PENDING" },
    }),
  ]);

  const revenueCents = enrolledRows.reduce(
    (sum, row) => sum + row.coursePrice.amountCents,
    0,
  );

  return {
    enrolled: enrolledRows.length,
    pending,
    revenue: revenueCents / 100,
    capacity,
    free: Math.max(0, capacity - enrolledRows.length),
  };
}
