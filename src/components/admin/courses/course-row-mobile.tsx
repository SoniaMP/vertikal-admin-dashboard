import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CourseActionsMenu } from "./course-actions-menu";
import { RegistrationClosedIcon } from "./registration-closed-icon";
import { DraftCourseIcon } from "./draft-course-icon";
import { isRegistrationClosed } from "@/helpers/registration-deadline";
import { formatCourseDate } from "./helpers";
import type { CourseRow, CourseTypeOption, InstructorOption } from "./types";

type Props = {
  course: CourseRow;
  courseTypes: CourseTypeOption[];
  instructors?: InstructorOption[];
  isInstructor?: boolean;
};

export function CourseRowMobile({ course, courseTypes, instructors, isInstructor }: Props) {
  const now = new Date();
  const spots = course.maxCapacity - course._count.registrations;
  const isPast = course.courseDate < now;
  const isClosed = isRegistrationClosed(course.registrationDeadline, now);
  const isDraft = course.status === "DRAFT";
  const showClosedWarning = isClosed && !isPast;
  const showDraftWarning = isDraft && !isPast;

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isPast ? "bg-muted-foreground/10 text-muted-foreground" : ""
      }`}
      aria-label={isPast ? "Curso pasado" : undefined}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {showDraftWarning && <DraftCourseIcon />}
          {showClosedWarning && <RegistrationClosedIcon />}
          <Link
            href={`/admin/cursos/${course.id}`}
            className="font-medium truncate hover:underline"
          >
            {course.title}
          </Link>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {formatCourseDate(course.courseDate)}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          Plazo: {formatCourseDate(course.registrationDeadline)}
        </p>
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
          instructors={instructors}
          isInstructor={isInstructor}
        />
      </div>
    </div>
  );
}
