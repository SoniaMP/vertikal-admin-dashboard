import { prisma } from "@/lib/prisma";

export type NextCourse = {
  title: string;
  courseDate: Date;
  taken: number;
  capacity: number;
};

/**
 * The next published course that has not happened yet, with how full it is.
 * An instructor sees their own; nobody sees drafts, which are not yet real
 * for anyone outside the club.
 */
export async function fetchNextCourse(
  instructorId?: string,
): Promise<NextCourse | null> {
  const course = await prisma.courseCatalog.findFirst({
    where: {
      status: "ACTIVE",
      courseDate: { gte: new Date() },
      ...(instructorId ? { instructorId } : {}),
    },
    orderBy: { courseDate: "asc" },
    select: {
      title: true,
      courseDate: true,
      maxCapacity: true,
      _count: { select: { registrations: true } },
    },
  });

  if (!course) return null;

  return {
    title: course.title,
    courseDate: course.courseDate,
    taken: course._count.registrations,
    capacity: course.maxCapacity,
  };
}
