import Link from "next/link";
import { cn } from "@/lib/utils";
import { TableRow } from "@/components/ui/table";
import { DataCell } from "@/components/admin/data-cell";
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

export function CourseRowDesktop({
  course,
  courseTypes,
  instructors,
  isInstructor,
}: Props) {
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
      <DataCell className="max-w-[260px] font-medium">
        <div className="flex items-center gap-2">
          {showDraftWarning && <DraftCourseIcon />}
          {showClosedWarning && <RegistrationClosedIcon />}
          <Link href={`/admin/cursos/${course.id}`} className="hover:underline">
            <TruncatedText text={course.title} />
          </Link>
        </div>
      </DataCell>
      <DataCell className="text-muted-foreground text-xs font-mono">
        {course.slug}
      </DataCell>
      <DataCell className="text-muted-foreground">
        {course.courseType.name}
      </DataCell>
      <DataCell kind="date" className="text-muted-foreground">
        {formatCourseDate(course.courseDate)}
      </DataCell>
      <DataCell kind="date" className="text-muted-foreground">
        {formatCourseDate(course.registrationDeadline)}
      </DataCell>
      {/* The count is the fact; "Lleno" is what it means, and only when it
          is true. The slash and the capacity stay grey so the number read
          down the column is the one that changes. */}
      <DataCell kind="number" className="whitespace-nowrap">
        {course._count.registrations}
        <span className="text-muted-foreground"> / {course.maxCapacity}</span>
        {spots <= 0 && (
          <span className="ml-2 align-middle">
            <StatusPill tone="warning">Lleno</StatusPill>
          </span>
        )}
      </DataCell>
      {!isInstructor && (
        <DataCell className="text-muted-foreground text-sm">
          {course.instructor?.name ?? "—"}
        </DataCell>
      )}
      <DataCell kind="actions">
        <CourseActionsMenu
          course={course}
          courseTypes={courseTypes}
          instructors={instructors}
          isInstructor={isInstructor}
        />
      </DataCell>
    </TableRow>
  );
}
