"use client";

import { useFilterNavigation } from "@/hooks/use-filter-navigation";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_STATUS } from "@/types";

const TABS = [
  { value: "all", label: "Todos" },
  { value: MEMBERSHIP_STATUS.ACTIVE, label: "Activos" },
  { value: MEMBERSHIP_STATUS.PENDING_PAYMENT, label: "Pendientes de pago" },
  { value: MEMBERSHIP_STATUS.EXPIRED, label: "Expirados" },
  { value: MEMBERSHIP_STATUS.CANCELLED, label: "Cancelados" },
] as const;

/**
 * The states of the list, as tabs on one rule. They used to be a select
 * reading "Estado: Todos", which hid both the states and which one was on.
 */
export function MembershipStatusTabs() {
  const { updateParam, searchParams } = useFilterNavigation();
  const current = searchParams.get("membershipStatus") ?? "all";

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
            onClick={() => updateParam("membershipStatus", tab.value)}
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
