import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchX } from "lucide-react";
import { CourseRowDesktop } from "./course-row-desktop";
import { CourseRowMobile } from "./course-row-mobile";
import type { CourseRow, CourseTypeOption, InstructorOption } from "./types";

type Props = {
  courses: CourseRow[];
  courseTypes: CourseTypeOption[];
  instructors?: InstructorOption[];
  isInstructor?: boolean;
};

export function CoursesTable({ courses, courseTypes, instructors, isInstructor }: Props) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <SearchX className="h-10 w-10" />
        <p className="text-sm">No se encontraron cursos.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {courses.map((c) => (
          <CourseRowMobile
            key={c.id}
            course={c}
            courseTypes={courseTypes}
            instructors={instructors}
            isInstructor={isInstructor}
          />
        ))}
      </div>
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Plazo</TableHead>
              <TableHead>Plazas</TableHead>
              {!isInstructor && <TableHead>Director</TableHead>}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <CourseRowDesktop
                key={c.id}
                course={c}
                courseTypes={courseTypes}
                instructors={instructors}
                isInstructor={isInstructor}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
