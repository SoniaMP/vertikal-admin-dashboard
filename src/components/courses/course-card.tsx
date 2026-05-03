import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/helpers/price-calculator";
import { isRegistrationClosed } from "@/helpers/registration-deadline";
import { CourseClosedBadge } from "./course-closed-badge";
import type { fetchPublicCourseList } from "@/lib/course-queries";

type PublicCourse = Awaited<ReturnType<typeof fetchPublicCourseList>>[number];

function formatCourseDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function CourseCard({ course }: { course: PublicCourse }) {
  const spotsUsed = course._count.registrations;
  const spotsLeft = Math.max(0, course.maxCapacity - spotsUsed);
  const isFull = spotsLeft === 0;
  const isClosed = isRegistrationClosed(course.registrationDeadline);
  const lowestPrice = course.prices[0]?.amountCents;

  return (
    <Link href={`/cursos/${course.slug}`} className="block">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="w-fit">
              {course.courseType.name}
            </Badge>
            {isClosed ? (
              <CourseClosedBadge
                registrationDeadline={course.registrationDeadline}
              />
            ) : (
              isFull && <Badge variant="destructive">Agotado</Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2 text-lg">
            {course.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 pb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0" />
            <span>{formatCourseDate(course.courseDate)}</span>
          </div>

          <div className="mt-2 flex items-center justify-between border-t pt-3">
            {lowestPrice !== undefined ? (
              <span className="text-base font-semibold text-foreground">
                Desde {formatPrice(lowestPrice)}
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1">
              <Users className="size-4" />
              <span>
                {isFull
                  ? "Sin plazas"
                  : `${spotsLeft} plaza${spotsLeft !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
