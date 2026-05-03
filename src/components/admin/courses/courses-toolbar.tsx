"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCoursesFilter } from "./use-courses-filter";
import type { CourseTypeOption } from "./types";

type Props = {
  courseTypes: CourseTypeOption[];
};

export function CoursesToolbar({ courseTypes }: Props) {
  const { updateParam, updateParamDebounced, clearAll, searchParams } =
    useCoursesFilter();

  const hasFilters = Array.from(searchParams.keys()).some(
    (k) => !["page"].includes(k),
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        placeholder="Buscar por título..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => updateParamDebounced("search", e.target.value)}
        className="sm:w-64"
      />

      <Select
        value={searchParams.get("courseTypeId") ?? "all"}
        onValueChange={(v) => updateParam("courseTypeId", v)}
      >
        <SelectTrigger className="sm:w-44">
          <SelectValue placeholder="Tipo de curso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tipo: Todos</SelectItem>
          {courseTypes.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="sm:w-36">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Estado: Todos</SelectItem>
          <SelectItem value="DRAFT">Borrador</SelectItem>
          <SelectItem value="ACTIVE">Publicado</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
