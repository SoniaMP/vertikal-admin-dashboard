"use client";

import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableHeader } from "@/components/admin/sortable-header";
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
  createdAt: Date;
  coursePrice: { name: string };
};

type Props = {
  participants: ParticipantRow[];
  sortBy: string;
  sortDir: "asc" | "desc";
  basePath: string;
};

export function ParticipantsTable({
  participants,
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
              />
              <SortableHeader
                field="lastName"
                label="Apellidos"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
              />
              <SortableHeader
                field="email"
                label="Email"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
              />
              <SortableHeader
                field="phone"
                label="Telefono"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
              />
              <SortableHeader
                field="dni"
                label="DNI"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
              />
              <SortableHeader
                field="dateOfBirth"
                label="Fecha nac."
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
              />
              <SortableHeader
                field="priceName"
                label="Cat. pago"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
              />
              <SortableHeader
                field="paymentStatus"
                label="Estado pago"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
              />
              <SortableHeader
                field="createdAt"
                label="Fecha inscripcion"
                currentSort={sortBy}
                currentDir={sortDir}
                basePath={basePath}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <ParticipantRowDesktop key={p.id} participant={p} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {participants.map((p) => (
          <ParticipantRowMobile key={p.id} participant={p} />
        ))}
      </div>
    </>
  );
}
