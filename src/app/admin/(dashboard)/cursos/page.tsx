import { auth } from "@/lib/auth";
import { fetchCourseList, fetchCourseTypes } from "@/lib/course-queries";
import { CoursesToolbar } from "@/components/admin/courses/courses-toolbar";
import { CoursesTable } from "@/components/admin/courses/courses-table";
import { CreateCourseButton } from "@/components/admin/courses/create-course-button";
import { Pagination } from "@/components/admin/pagination";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [params, session] = await Promise.all([searchParams, auth()]);
  const isInstructor = session?.user?.role === "INSTRUCTOR";
  const filters = {
    ...parseParams(params),
    ...(isInstructor && { instructorId: session.user.id }),
  };

  const [{ courses, total, pageSize }, courseTypes] = await Promise.all([
    fetchCourseList(filters),
    fetchCourseTypes(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isInstructor ? "Mis cursos" : "Cursos"}
        </h1>
        <CreateCourseButton courseTypes={courseTypes} />
      </div>
      <CoursesToolbar courseTypes={courseTypes} />
      <CoursesTable
        courses={courses}
        courseTypes={courseTypes}
        isInstructor={isInstructor}
      />
      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
      />
    </div>
  );
}

function parseParams(params: Record<string, string | string[] | undefined>) {
  const str = (key: string) => {
    const v = params[key];
    return typeof v === "string" ? v : undefined;
  };

  return {
    search: str("search"),
    courseTypeId: str("courseTypeId"),
    status: str("status"),
    page: Math.max(1, Number(str("page")) || 1),
  };
}
