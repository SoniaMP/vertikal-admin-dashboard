import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { fetchCourseDetail } from "@/lib/course-queries";
import {
  fetchCourseParticipants,
  parseParticipantParams,
} from "@/lib/course-participant-queries";
import { CourseDetailHeader } from "@/components/admin/courses/course-detail-header";
import { ParticipantsSection } from "@/components/admin/courses/participants-section";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CourseDetailPage({
  params,
  searchParams,
}: Props) {
  const [{ id }, rawParams, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ]);

  const course = await fetchCourseDetail(id);
  if (!course) notFound();

  const isInstructor = session?.user?.role === "INSTRUCTOR";
  if (isInstructor && course.instructorId !== session.user.id) {
    notFound();
  }

  const filters = parseParticipantParams(rawParams, id);
  const { participants, total, pageSize } =
    await fetchCourseParticipants(filters);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/cursos">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
        <h1 className="text-xl font-bold sm:text-2xl">{course.title}</h1>
      </div>

      <CourseDetailHeader course={course} />

      <ParticipantsSection
        courseId={id}
        prices={course.prices.map((p) => ({
          id: p.id,
          name: p.name,
          amountCents: p.amountCents,
        }))}
        participants={participants}
        total={total}
        totalPages={totalPages}
        pageSize={pageSize}
        currentPage={filters.page}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir}
      />
    </div>
  );
}
