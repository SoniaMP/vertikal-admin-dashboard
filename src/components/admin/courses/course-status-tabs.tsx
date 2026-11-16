"use client";

import { cn } from "@/lib/utils";
import { useCoursesFilter } from "./use-courses-filter";

const TABS = [
  { value: "all", label: "Todos" },
  { value: "ACTIVE", label: "Publicados" },
  { value: "DRAFT", label: "Borradores" },
] as const;

/** The states of the list, on one rule, instead of a select that hid them. */
export function CourseStatusTabs() {
  const { updateParam, searchParams } = useCoursesFilter();
  const current = searchParams.get("status") ?? "all";

  return (
    <div className="flex gap-6 border-b" role="tablist">
      {TABS.map((tab) => {
        const isSelected = tab.value === current;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => updateParam("status", tab.value)}
            className={cn(
              "relative -mb-px cursor-pointer py-2.5 text-sm",
              isSelected
                ? "font-medium text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
