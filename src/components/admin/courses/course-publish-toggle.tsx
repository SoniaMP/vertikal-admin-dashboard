"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { togglePublished } from "@/app/admin/(dashboard)/cursos/actions";

type Props = {
  courseId: string;
  initialPublished: boolean;
  isAdmin: boolean;
};

const INSTRUCTOR_TOOLTIP = "La publicación la realiza un administrador.";

export function CoursePublishToggle({
  courseId,
  initialPublished,
  isAdmin,
}: Props) {
  const [published, setPublished] = useState(initialPublished);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setPublished(next);
    startTransition(async () => {
      const result = await togglePublished(courseId, next);
      if (!result.success) setPublished(!next);
    });
  }

  const switchEl = (
    <Switch
      id="publish-toggle"
      checked={published}
      onCheckedChange={handleChange}
      disabled={!isAdmin || isPending}
      aria-label={published ? "Despublicar curso" : "Publicar curso"}
    />
  );

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        switchEl
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">{switchEl}</span>
            </TooltipTrigger>
            <TooltipContent>{INSTRUCTOR_TOOLTIP}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <Label htmlFor="publish-toggle" className="text-sm font-normal">
        {published ? "Publicado" : "Borrador"}
      </Label>
    </div>
  );
}
