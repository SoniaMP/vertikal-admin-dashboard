import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SortField, SortDirection } from "@/types/membership-filters";
import { SortableHeader } from "./sortable-header";
import { DesktopRow } from "./membership-row-desktop";
import { MobileCard } from "./membership-row-mobile";
import { EmptyState } from "./empty-state";

export type MembershipRow = {
  id: string;
  status: string;
  paymentStatus: string;
  isFederated: boolean;
  totalAmount: number;
  createdAt: Date;
  member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    dateOfBirth: string;
    sex: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
  };
  type: { name: string } | null;
  subtype: { name: string } | null;
};

type Props = {
  memberships: MembershipRow[];
  sortBy: SortField;
  sortDir: SortDirection;
};

export function MembershipsTable({ memberships, sortBy, sortDir }: Props) {
  if (memberships.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {memberships.map((m) => (
          <MobileCard key={m.id} membership={m} />
        ))}
      </div>
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="memberName" label="Nombre" currentSort={sortBy} currentDir={sortDir} />
              <SortableHeader field="email" label="Email" currentSort={sortBy} currentDir={sortDir} />
              <TableHead>Sexo</TableHead>
              <TableHead>Licencia</TableHead>
              <SortableHeader field="totalAmount" label="Total" currentSort={sortBy} currentDir={sortDir} />
              <SortableHeader field="status" label="Estado" currentSort={sortBy} currentDir={sortDir} />
              <TableHead>Federado</TableHead>
              <SortableHeader field="createdAt" label="Fecha" currentSort={sortBy} currentDir={sortDir} />
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.map((m) => (
              <DesktopRow key={m.id} membership={m} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
