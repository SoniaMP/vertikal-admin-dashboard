import { Badge } from "@/components/ui/badge";
import { formatCourseDate } from "./helpers";
import { CourseStatusBadge } from "./course-status-badge";

type CourseDetail = {
  status: string;
  courseDate: Date;
  maxCapacity: number;
  _count: { registrations: number };
};

type Props = { course: CourseDetail };

export function CourseDetailHeader({ course }: Props) {
  const enrolled = course._count.registrations;
  const isFull = enrolled >= course.maxCapacity;

  return (
    <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
      <CourseStatusBadge status={course.status} />
      <span>{formatCourseDate(course.courseDate)}</span>
      <span aria-label="separator">·</span>
      <span className="tabular-nums">
        {enrolled} / {course.maxCapacity} plazas
      </span>
      {isFull && (
        <Badge variant="destructive" className="ml-1">
          Lleno
        </Badge>
      )}
    </p>
  );
}
