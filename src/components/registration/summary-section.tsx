"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type SummarySectionProps = {
  title: string;
  onEdit: () => void;
  children: ReactNode;
};

export function SummarySection({
  title,
  onEdit,
  children,
}: SummarySectionProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </Button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
