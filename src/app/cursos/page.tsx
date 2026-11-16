// The course list is read from the database on every request, so it cannot
// be prerendered: the build worker has no database to open, which is what
// made `npm run build` fail here.
export const dynamic = "force-dynamic";

import { fetchPublicCourseList } from "@/lib/course-queries";
import { CourseCard } from "@/components/courses/course-card";

export default async function CursosPage() {
  const courses = await fetchPublicCourseList();

  return (
    <>
      <h1 className="text-[length:var(--step-head)] font-semibold leading-none tracking-[-0.035em]">Cursos</h1>
      <p className="mt-4 max-w-[40ch] text-muted-foreground">
        Fechas, plazas y precios de los cursos del Club Vertikal.
      </p>

      {courses.length === 0 ? (
        <p className="mt-12 text-muted-foreground">
          No hay cursos disponibles en este momento.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </>
  );
}
