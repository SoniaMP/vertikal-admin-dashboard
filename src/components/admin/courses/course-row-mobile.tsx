import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CourseStatusBadge } from "./course-status-badge";
import { CourseStatusSelect } from "./course-status-select";
import { CourseActionsMenu } from "./course-actions-menu";
import { formatCourseDate } from "./helpers";
import type { CourseRow, CourseTypeOption } from "./types";

type Props = {
  course: CourseRow;
  courseTypes: CourseTypeOption[];
  isInstructor?: boolean;
};

export function CourseRowMobile({ course, courseTypes, isInstructor }: Props) {
  const spots = course.maxCapacity - course._count.registrations;

  return (
    <div className="rounded-lg border p-4 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/admin/cursos/${course.id}`}
            className="font-medium truncate hover:underline"
          >
            {course.title}
          </Link>
          <p className="text-sm text-muted-foreground truncate">
            {formatCourseDate(course.courseDate)}
          </p>
        </div>
        {isInstructor ? (
          <CourseStatusBadge status={course.status} />
        ) : (
          <CourseStatusSelect courseId={course.id} status={course.status} />
        )}
      </div>
      <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="outline">{course.courseType.name}</Badge>
        {!isInstructor && course.instructor && (
          <span>{course.instructor.name}</span>
        )}
        <span className="tabular-nums">
          {course._count.registrations} / {course.maxCapacity}
        </span>
        {spots <= 0 && (
          <Badge variant="destructive">Lleno</Badge>
        )}
      </div>
      <div className="mt-2 flex justify-end border-t pt-2">
        <CourseActionsMenu
          course={course}
          courseTypes={courseTypes}
          isInstructor={isInstructor}
        />
      </div>
    </div>
  );
}
