"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import {
  ParticipantsTable,
  type ParticipantRow,
} from "./participants-table";
import {
  AddEnrolleeDialog,
  type PriceOption,
} from "./add-enrollee-dialog";

type Props = {
  courseId: string;
  prices: PriceOption[];
  participants: ParticipantRow[];
  total: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
  sortBy: string;
  sortDir: "asc" | "desc";
};

export function ParticipantsSection({
  courseId,
  prices,
  participants,
  total,
  totalPages,
  pageSize,
  currentPage,
  sortBy,
  sortDir,
}: Props) {
  const basePath = `/admin/cursos/${courseId}`;
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSearch = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        params.delete("page");
        router.push(`${basePath}?${params.toString()}`);
      }, 300);
    },
    [router, searchParams, basePath],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">
          Participantes ({total})
        </h2>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por nombre, DNI o email..."
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="sm:w-64"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={`${basePath}/export`} download>
              <Download className="h-3.5 w-3.5" />
              Exportar
            </a>
          </Button>
        </div>
      </div>

      <ParticipantsTable
        participants={participants}
        courseId={courseId}
        sortBy={sortBy}
        sortDir={sortDir}
        basePath={basePath}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        basePath={basePath}
        itemLabel="participantes"
      />

      <AddEnrolleeDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        courseId={courseId}
        prices={prices}
      />
    </section>
  );
}
