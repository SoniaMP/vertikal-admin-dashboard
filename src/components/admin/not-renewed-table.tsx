import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { DataCell } from "./data-cell";
import { DataHead } from "./data-head";

export type NotRenewedMember = {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
};

type Props = {
  members: NotRenewedMember[];
  previousSeasonName: string;
};

export function NotRenewedTable({ members, previousSeasonName }: Props) {
  if (members.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Todos los miembros de la temporada &quot;{previousSeasonName}&quot; han
        renovado.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {members.map((m) => (
          <NotRenewedMobileCard key={m.id} member={m} />
        ))}
      </div>
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <DataHead>Nombre</DataHead>
              <DataHead>DNI</DataHead>
              <DataHead>Email</DataHead>
              <DataHead>Teléfono</DataHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <DataCell className="max-w-[220px] font-medium">
                  {m.firstName} {m.lastName}
                </DataCell>
                <DataCell>{m.dni}</DataCell>
                <DataCell className="max-w-[240px] text-muted-foreground">
                  {m.email}
                </DataCell>
                <DataCell className="text-muted-foreground">{m.phone}</DataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function NotRenewedMobileCard({ member: m }: { member: NotRenewedMember }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="font-medium">
        {m.firstName} {m.lastName}
      </p>
      <p className="text-sm text-muted-foreground">{m.email}</p>
      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
        <span>DNI: {m.dni}</span>
        <span>{m.phone}</span>
      </div>
    </div>
  );
}
