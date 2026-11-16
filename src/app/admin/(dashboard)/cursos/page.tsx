import { auth } from "@/lib/auth";
import { fetchCourseList, fetchCourseTypes } from "@/lib/course-queries";
import { fetchInstructors } from "@/lib/user-queries";
import { fetchNextCourse } from "@/lib/next-course";
import { formatNextCourseFinding } from "@/helpers/next-course-finding";
import { CoursesToolbar } from "@/components/admin/courses/courses-toolbar";
import { CourseStatusTabs } from "@/components/admin/courses/course-status-tabs";
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
  const isAdmin = session?.user?.role === "ADMIN";
  const filters = {
    ...parseParams(params),
    ...(isInstructor && { instructorId: session.user.id }),
  };

  const [{ courses, total, pageSize }, courseTypes, instructors, nextCourse] =
    await Promise.all([
      fetchCourseList(filters),
      fetchCourseTypes(),
      isInstructor ? Promise.resolve([]) : fetchInstructors(),
      fetchNextCourse(isInstructor ? session.user.id : undefined),
    ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isInstructor ? "Mis cursos" : "Cursos"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatNextCourseFinding(nextCourse)}
          </p>
        </div>
        <CreateCourseButton
          courseTypes={courseTypes}
          instructors={instructors}
          isAdmin={isAdmin}
        />
      </div>
      <CourseStatusTabs />
      <CoursesToolbar courseTypes={courseTypes} />
      <CoursesTable
        courses={courses}
        courseTypes={courseTypes}
        instructors={instructors}
        isInstructor={isInstructor}
      />
      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        itemLabel={{ one: "curso", many: "cursos" }}
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
