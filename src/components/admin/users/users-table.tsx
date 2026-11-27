"use client";

import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { DataCell } from "@/components/admin/data-cell";
import { DataHead } from "@/components/admin/data-head";
import { StatusPill } from "../status-pill";
import { UserActionsMenu } from "./user-actions-menu";
import type { UserFormData } from "./user-form-dialog";

type UserRow = UserFormData & { createdAt: Date };

type Props = {
  users: UserRow[];
  currentUserId: string;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  INSTRUCTOR: "Instructor",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function UsersTable({ users, currentUserId }: Props) {
  if (users.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No hay usuarios registrados.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <DataHead>Nombre</DataHead>
          <DataHead>Email</DataHead>
          <DataHead kind="status">Rol</DataHead>
          <DataHead kind="date">Creado</DataHead>
          <DataHead kind="actions">
            <span className="sr-only">Acciones</span>
          </DataHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="h-12">
            <DataCell className="max-w-[220px] font-medium">
              {user.name}
            </DataCell>
            <DataCell className="max-w-[240px] text-muted-foreground">
              {user.email}
            </DataCell>
            <DataCell kind="status">
              <RoleBadge roleName={user.roleName} />
            </DataCell>
            <DataCell kind="date" className="text-muted-foreground">
              {formatDate(user.createdAt)}
            </DataCell>
            <DataCell kind="actions">
              <UserActionsMenu user={user} isSelf={user.id === currentUserId} />
            </DataCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * A role is not a status: it says what someone may do, not whether anything
 * is wrong. Both roles take the same neutral tint and the word tells them
 * apart, instead of a blue and a purple that mean nothing to the reader.
 */
function RoleBadge({ roleName }: { roleName: string }) {
  return (
    <StatusPill tone="neutral">{ROLE_LABELS[roleName] ?? roleName}</StatusPill>
  );
}
