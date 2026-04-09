import { notFound } from "next/navigation";
import { CalendarDays, Clock, Users } from "lucide-react";
import { fetchCourseBySlug } from "@/lib/course-queries";
import { CourseRegistrationWizard } from "@/components/courses/course-registration-wizard";
import { Card, CardContent } from "@/components/ui/card";

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
  const spotsUsed = course._count.registrations;
  const spotsLeft = Math.max(0, course.maxCapacity - spotsUsed);
  const isFull = spotsLeft === 0;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-bold sm:text-2xl">{course.title}</h2>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatCourseDate(course.courseDate)}
          </span>
          {!isPast && (
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
      ) : (
        <section>
          <h3 className="mb-4 text-lg font-semibold">Inscripción</h3>
          <Card>
            <CardContent>
              <CourseRegistrationWizard
                courseCatalogId={course.id}
                courseTitle={course.title}
                prices={course.prices}
                isFull={isFull}
              />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
