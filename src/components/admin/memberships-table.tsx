import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import type { SortField, SortDirection } from "@/types/membership-filters";
import { DataHead } from "./data-head";
import { SortableHeader } from "./sortable-header";
import { DesktopRow } from "./membership-row-desktop";
import { MobileCard } from "./membership-row-mobile";
import { EmptyState } from "./empty-state";

/* Email and sex fold under the name between 768 and 1024, where nine columns
   broke every name over three lines. */
const FOLD = "hidden lg:table-cell";

export type MembershipRow = {
  id: string;
  status: string;
  paymentStatus: string;
  isFederated: boolean;
  hasClubLicense: boolean;
  externalLicenseLabel: string | null;
  externalLicenseFileUrl: string | null;
  externalLicenseVerifiedAt: Date | null;
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
              <SortableHeader
                field="memberName"
                label="Nombre"
                currentSort={sortBy}
                currentDir={sortDir}
              />
              <SortableHeader
                field="email"
                label="Email"
                currentSort={sortBy}
                currentDir={sortDir}
                className={FOLD}
              />
              <DataHead className={FOLD}>Sexo</DataHead>
              <DataHead>Licencia</DataHead>
              <SortableHeader
                field="totalAmount"
                label="Total"
                currentSort={sortBy}
                currentDir={sortDir}
                kind="number"
              />
              <SortableHeader
                field="status"
                label="Pago"
                currentSort={sortBy}
                currentDir={sortDir}
                kind="status"
              />
              <DataHead>Federativa</DataHead>
              <SortableHeader
                field="createdAt"
                label="Alta"
                currentSort={sortBy}
                currentDir={sortDir}
                kind="date"
              />
              <DataHead kind="actions">
                <span className="sr-only">Acciones</span>
              </DataHead>
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
