"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseTypeFormDialog } from "./course-type-form-dialog";
import type { CourseTypeOption } from "./types";

type Props = {
  courseTypes: CourseTypeOption[];
  defaultCourseTypeId?: string;
};

const NONE_VALUE = "__none__";

function mergeById(
  fromServer: CourseTypeOption[],
  justCreated: CourseTypeOption[],
): CourseTypeOption[] {
  const byId = new Map(fromServer.map((type) => [type.id, type]));
  for (const type of justCreated) byId.set(type.id, type);
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function CourseTypeField({ courseTypes, defaultCourseTypeId }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createdCourseTypes, setCreatedCourseTypes] = useState<
    CourseTypeOption[]
  >([]);
  const [selectedId, setSelectedId] = useState(
    defaultCourseTypeId || NONE_VALUE,
  );

  // A category created here is selected right away, and it is added to the
  // options in the same update so that the value always points at an option
  // that exists.
  function selectCreatedCourseType(courseType: CourseTypeOption) {
    setCreatedCourseTypes((current) => [...current, courseType]);
    setSelectedId(courseType.id);
  }

  // Radix reports an empty value back whenever its hidden native select cannot
  // represent the current one, which happens right after a brand new category
  // is selected. "Sin categoría" travels as NONE_VALUE, so an empty value is
  // never a real choice here and must not overwrite ours.
  function handleValueChange(value: string) {
    if (value) setSelectedId(value);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="courseTypeId">Categoría</Label>
      {/* `courseTypeId` is submitted by this input, not by the Select, so that
          "Sin categoría" travels as an empty value instead of the sentinel. */}
      <input
        type="hidden"
        name="courseTypeId"
        value={selectedId === NONE_VALUE ? "" : selectedId}
      />
      <div className="flex gap-2">
        <Select value={selectedId} onValueChange={handleValueChange}>
          <SelectTrigger id="courseTypeId">
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>Sin categoría</SelectItem>
            {mergeById(courseTypes, createdCourseTypes).map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsDialogOpen(true)}
          aria-label="Nueva categoría"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <CourseTypeFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreated={selectCreatedCourseType}
      />
    </div>
  );
}
