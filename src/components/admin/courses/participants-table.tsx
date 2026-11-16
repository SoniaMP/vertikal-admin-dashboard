"use client";

import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableHead } from "@/components/ui/table";
import { SortableHeader } from "@/components/admin/sortable-header";

/* 12px grey, no fill band, like every other table in the panel. */
const HEAD = "h-9 px-2 text-xs font-normal text-muted-foreground";
const HEAD_NUM = `${HEAD} text-right`;
import { ParticipantRowDesktop } from "./participant-row-desktop";
import { ParticipantRowMobile } from "./participant-row-mobile";

export type ParticipantRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dni: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  paymentStatus: string;
  licenseType: string | null;
  licenseFileUrl: string | null;
  createdAt: Date;
  coursePrice: { name: string };
};

type Props = {
  participants: ParticipantRow[];
  courseId: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  basePath: string;
};

export function ParticipantsTable({
  participants,
  courseId,
  sortBy,
  sortDir,
  basePath,
}: Props) {
  if (participants.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No se encontraron participantes.
      </p>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader
                field="firstName"
                label="Nombre"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
                className={HEAD}
              />
              <SortableHeader
                field="lastName"
                label="Apellidos"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
                className={HEAD}
              />
              <SortableHeader
                field="email"
                label="Email"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
                className={HEAD}
              />
              <SortableHeader
                field="phone"
                label="Telefono"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
                className={HEAD}
              />
              <SortableHeader
                field="dni"
                label="DNI"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
                className={HEAD}
              />
              <SortableHeader
                field="dateOfBirth"
                label="Fecha nac."
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
                className={HEAD}
              />
              <SortableHeader
                field="priceName"
                label="Cat. pago"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
                className={HEAD}
              />
              <SortableHeader
                field="paymentStatus"
                label="Estado pago"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
                className={HEAD}
              />
              <TableHead className={HEAD}>Tipo licencia</TableHead>
              <TableHead className={HEAD}>PDF</TableHead>
              <SortableHeader
                field="createdAt"
                label="Fecha inscripción"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
                className={HEAD_NUM}
              />
              <TableHead className={`${HEAD} w-12`}>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <ParticipantRowDesktop key={p.id} participant={p} courseId={courseId} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {participants.map((p) => (
          <ParticipantRowMobile key={p.id} participant={p} courseId={courseId} />
        ))}
      </div>
    </>
  );
}
