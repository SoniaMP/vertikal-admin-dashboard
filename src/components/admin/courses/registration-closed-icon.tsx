"use client";

import { AlertTriangle } from "lucide-react";
import { RowWarningIcon } from "./row-warning-icon";

const TOOLTIP = "El plazo de inscripción de este curso ha finalizado.";

export function RegistrationClosedIcon() {
  return (
    <RowWarningIcon
      icon={
        <AlertTriangle
          className="size-4 text-amber-500 shrink-0"
          aria-label={TOOLTIP}
        />
      }
      tooltip={TOOLTIP}
    />
  );
}
