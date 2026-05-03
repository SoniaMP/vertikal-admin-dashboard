import { Badge } from "@/components/ui/badge";
import { formatCourseDate } from "./helpers";
import { CoursePublishToggle } from "./course-publish-toggle";

type CourseDetail = {
  id: string;
  status: string;
  courseDate: Date;
  maxCapacity: number;
  _count: { registrations: number };
};

type Props = { course: CourseDetail; isAdmin: boolean };

export function CourseDetailHeader({ course, isAdmin }: Props) {
  const enrolled = course._count.registrations;
  const isFull = enrolled >= course.maxCapacity;
  const isPublished = course.status === "ACTIVE";

  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4 sm:flex-wrap">
      <CoursePublishToggle
        courseId={course.id}
        initialPublished={isPublished}
        isAdmin={isAdmin}
      />
      <div className="flex items-center gap-2 flex-wrap">
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
      </div>
    </div>
  );
}
