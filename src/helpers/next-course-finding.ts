import type { NextCourse } from "@/lib/next-course";

/**
 * The one line under the courses title: which course is next and whether it
 * still has room, which is what the club is asked on the phone all week.
 */
export function formatNextCourseFinding(next: NextCourse | null): string {
  if (!next) {
    return "No hay cursos publicados a partir de hoy.";
  }

  const free = next.capacity - next.taken;
  const day = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
  }).format(next.courseDate);

  if (free <= 0) {
    return `El próximo es «${next.title}», el ${day}, y está lleno.`;
  }

  const spots = free === 1 ? "queda 1 plaza" : `quedan ${free} plazas`;
  return `El próximo es «${next.title}», el ${day}: ${spots} de ${next.capacity}.`;
}
