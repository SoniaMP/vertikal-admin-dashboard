import { formatCourseDate } from "./helpers";
import { CoursePublishToggle } from "./course-publish-toggle";
import { StatusPill } from "../status-pill";

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
      {/* The places live in the strip below, once. Here the header says only
          what the strip does not: the day it happens, and whether it is full. */}
      <div className="flex flex-wrap items-center gap-2">
        <span>{formatCourseDate(course.courseDate)}</span>
        {isFull && <StatusPill tone="warning">Lleno</StatusPill>}
      </div>
    </div>
  );
}
