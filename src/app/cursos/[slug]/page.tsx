// The course list is read from the database on every request, so it cannot
// be prerendered: the build worker has no database to open, which is what
// made `npm run build` fail here.
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { CalendarDays, Clock, Users } from "lucide-react";
import { fetchCourseBySlug } from "@/lib/course-queries";
import { CourseRegistrationWizard } from "@/components/courses/course-registration-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { isRegistrationClosed } from "@/helpers/registration-deadline";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

function formatCourseDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await fetchCourseBySlug(slug);

  if (!course) notFound();

  const isPast = course.courseDate < new Date();
  const isClosed = isRegistrationClosed(course.registrationDeadline);
  const spotsUsed = course._count.registrations;
  const spotsLeft = Math.max(0, course.maxCapacity - spotsUsed);
  const isFull = spotsLeft === 0;
  const showWizard = !isPast && !isClosed;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-[length:var(--step-head)] font-semibold leading-none tracking-[-0.035em]">{course.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatCourseDate(course.courseDate)}
          </span>
          {showWizard && (
            <span className="flex items-center gap-1.5">
              <Users className="size-4" />
              {isFull
                ? "Sin plazas"
                : `${spotsLeft} plaza${spotsLeft !== 1 ? "s" : ""} disponible${spotsLeft !== 1 ? "s" : ""}`}
            </span>
          )}
        </div>
      </section>

      {isPast ? (
        <Card className="border-muted">
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="size-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Este curso tuvo lugar el {formatCourseDate(course.courseDate)}. El
              formulario de inscripción ya no está disponible.
            </p>
          </CardContent>
        </Card>
      ) : isClosed ? (
        <Card className="border-muted">
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="size-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Inscripciones cerradas. Contacta con administración si necesitas
              inscribirte.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section>
          <h2 className="mb-8 text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-primary">
            Inscripción
          </h2>
          <CourseRegistrationWizard
            courseCatalogId={course.id}
            courseTitle={course.title}
            prices={course.prices}
            isFull={isFull}
          />
        </section>
      )}
    </div>
  );
}
