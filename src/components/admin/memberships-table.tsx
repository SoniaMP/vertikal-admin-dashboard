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

/* 12px grey sentence case, no fill band: the header labels the data without
   competing with it. */
const HEAD = "h-9 px-2 text-xs font-normal text-muted-foreground";
const HEAD_NUM = `${HEAD} text-right`;
/* Email and sex fold under the name between 768 and 1024, where nine columns
   broke every name over three lines. */
const HEAD_FOLD = `${HEAD} hidden lg:table-cell`;

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
              <SortableHeader field="memberName" label="Nombre" currentSort={sortBy} currentDir={sortDir} className={HEAD} />
              <SortableHeader field="email" label="Email" currentSort={sortBy} currentDir={sortDir} className={HEAD_FOLD} />
              <TableHead className={HEAD_FOLD}>Sexo</TableHead>
              <TableHead className={HEAD}>Licencia</TableHead>
              <SortableHeader field="totalAmount" label="Total" currentSort={sortBy} currentDir={sortDir} className={HEAD_NUM} />
              <SortableHeader field="status" label="Pago" currentSort={sortBy} currentDir={sortDir} className={HEAD} />
              <TableHead className={HEAD}>Federativa</TableHead>
              <SortableHeader field="createdAt" label="Alta" currentSort={sortBy} currentDir={sortDir} className={HEAD_NUM} />
              <TableHead className={HEAD_NUM}>
                <span className="sr-only">Acciones</span>
              </TableHead>
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
