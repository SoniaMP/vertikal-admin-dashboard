"use client";

import { EyeOff } from "lucide-react";
import { RowWarningIcon } from "./row-warning-icon";

const TOOLTIP = "Este curso está en borrador y aún no es público.";

export function DraftCourseIcon() {
  return (
    <RowWarningIcon
      icon={
        <EyeOff
          className="size-4 text-slate-500 shrink-0"
          aria-label={TOOLTIP}
        />
      }
      tooltip={TOOLTIP}
    />
  );
}
