"use client";

import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RegistrationClosedIcon() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertTriangle
            className="size-4 text-amber-500 shrink-0"
            aria-label="Plazo de inscripción finalizado"
          />
        </TooltipTrigger>
        <TooltipContent>
          El plazo de inscripción de este curso ha finalizado.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
