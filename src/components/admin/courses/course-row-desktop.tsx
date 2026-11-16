import Link from "next/link";
import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusPill } from "../status-pill";
import { CourseActionsMenu } from "./course-actions-menu";
import { RegistrationClosedIcon } from "./registration-closed-icon";
import { DraftCourseIcon } from "./draft-course-icon";
import { isRegistrationClosed } from "@/helpers/registration-deadline";
import { formatCourseDate } from "./helpers";
import type { CourseRow, CourseTypeOption, InstructorOption } from "./types";
import { TruncatedText } from "@/components/ui/truncated-text";

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
  const isDraft = course.status === "DRAFT";

  const showClosedWarning = isClosed && !isPast;
  const showDraftWarning = isDraft && !isPast;

  return (
    <TableRow
      className={cn("h-12", isPast && "text-muted-foreground")}
      aria-label={isPast ? "Curso pasado" : undefined}
    >
      <TableCell className="max-w-[260px] font-medium">
        <div className="flex items-center gap-2">
          {showDraftWarning && <DraftCourseIcon />}
          {showClosedWarning && <RegistrationClosedIcon />}
          <Link
            href={`/admin/cursos/${course.id}`}
            className="hover:underline"
          >
            <TruncatedText text={course.title} />
          </Link>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs font-mono">
        {course.slug}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {course.courseType.name}
      </TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground">
        {formatCourseDate(course.courseDate)}
      </TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground">
        {formatCourseDate(course.registrationDeadline)}
      </TableCell>
      {/* The count is the fact; "Lleno" is what it means, and only when it
          is true. The slash and the capacity stay grey so the number read
          down the column is the one that changes. */}
      <TableCell className="text-right tabular-nums whitespace-nowrap">
        {course._count.registrations}
        <span className="text-muted-foreground"> / {course.maxCapacity}</span>
        {spots <= 0 && (
          <span className="ml-2 align-middle">
            <StatusPill tone="warning">Lleno</StatusPill>
          </span>
        )}
      </TableCell>
      {!isInstructor && (
        <TableCell className="text-muted-foreground text-sm">
          {course.instructor?.name ?? "—"}
        </TableCell>
      )}
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
