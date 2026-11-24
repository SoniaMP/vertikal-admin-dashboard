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
  /** The year new registrations land in today, marked so nobody has to guess. */
  activeYear: number;
};

/**
 * Picks which season's registrations to look at.
 *
 * The options are years, not stored rows: a season is a calendar year, so a
 * year with nothing in it yet is still a season you can look at — it just
 * comes up empty.
 */
export function SeasonSelector({ years, selectedYear, activeYear }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(year: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    params.delete("page");
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <Select value={String(selectedYear)} onValueChange={handleChange}>
      <SelectTrigger className="w-40" aria-label="Temporada">
        <SelectValue placeholder="Temporada" />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
            {year === activeYear ? " (actual)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
