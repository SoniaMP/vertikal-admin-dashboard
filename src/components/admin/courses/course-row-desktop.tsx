import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CourseStatusBadge } from "./course-status-badge";
import { CourseStatusSelect } from "./course-status-select";
import { CourseActionsMenu } from "./course-actions-menu";
import { RegistrationClosedIcon } from "./registration-closed-icon";
import { isRegistrationClosed } from "@/helpers/registration-deadline";
import { formatCourseDate } from "./helpers";
import type { CourseRow, CourseTypeOption, InstructorOption } from "./types";

type Props = {
  course: CourseRow;
  courseTypes: CourseTypeOption[];
  instructors?: InstructorOption[];
  isInstructor?: boolean;
};

export function CourseRowDesktop({ course, courseTypes, instructors, isInstructor }: Props) {
  const now = new Date();
  const spots = course.maxCapacity - course._count.registrations;
  const isPast = course.courseDate < now;
  const isClosed = isRegistrationClosed(course.registrationDeadline, now);

  const showClosedWarning = isClosed && !isPast;

  return (
    <TableRow
      className={
        isPast ? "bg-muted-foreground/10 text-muted-foreground" : undefined
      }
      aria-label={isPast ? "Curso pasado" : undefined}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {showClosedWarning && <RegistrationClosedIcon />}
          <Link
            href={`/admin/cursos/${course.id}`}
            className="hover:underline"
          >
            {course.title}
          </Link>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs font-mono">
        {course.slug}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{course.courseType.name}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatCourseDate(course.courseDate)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatCourseDate(course.registrationDeadline)}
      </TableCell>
      <TableCell className="tabular-nums">
        {course._count.registrations} / {course.maxCapacity}
        {spots <= 0 && (
          <Badge variant="destructive" className="ml-2">
            Lleno
          </Badge>
        )}
      </TableCell>
      {!isInstructor && (
        <TableCell className="text-muted-foreground text-sm">
          {course.instructor?.name ?? "—"}
        </TableCell>
      )}
      <TableCell>
        {isInstructor ? (
          <CourseStatusBadge status={course.status} />
        ) : (
          <CourseStatusSelect courseId={course.id} status={course.status} />
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end">
          <CourseActionsMenu
            course={course}
            courseTypes={courseTypes}
            instructors={instructors}
            isInstructor={isInstructor}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
