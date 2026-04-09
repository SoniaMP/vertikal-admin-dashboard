import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CourseStatusBadge } from "./course-status-badge";
import { CourseActionsMenu } from "./course-actions-menu";
import { formatCourseDate } from "./helpers";
import type { CourseRow, CourseTypeOption } from "./types";

type Props = {
  course: CourseRow;
  courseTypes: CourseTypeOption[];
};

export function CourseRowDesktop({ course, courseTypes }: Props) {
  const spots = course.maxCapacity - course._count.registrations;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          href={`/admin/cursos/${course.id}`}
          className="hover:underline"
        >
          {course.title}
        </Link>
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
      <TableCell className="tabular-nums">
        {course._count.registrations} / {course.maxCapacity}
        {spots <= 0 && (
          <Badge variant="destructive" className="ml-2">
            Lleno
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <CourseStatusBadge status={course.status} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end">
          <CourseActionsMenu course={course} courseTypes={courseTypes} />
        </div>
      </TableCell>
    </TableRow>
  );
}
