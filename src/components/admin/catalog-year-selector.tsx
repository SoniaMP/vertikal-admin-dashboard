"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  years: number[];
  selectedYear: number;
  currentYear: number;
};

/**
 * Which year's prices the screen is showing. The season is the calendar year,
 * so this is the whole of it: no names, no ranges.
 */
export function CatalogYearSelector({ years, selectedYear, currentYear }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleYearChange(year: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    router.push(`/admin/tipos-federacion?${params.toString()}`);
  }

  return (
    <Select value={String(selectedYear)} onValueChange={handleYearChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Año" />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
            {year === currentYear ? " (actual)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
