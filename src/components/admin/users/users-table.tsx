"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "../status-pill";
import { UserActionsMenu } from "./user-actions-menu";
import type { UserFormData } from "./user-form-dialog";

type UserRow = UserFormData & { createdAt: Date };

type Props = {
  users: UserRow[];
  currentUserId: string;
};

/* The same header voice as the other two tables: 12px grey, no fill band. */
const HEAD = "h-9 px-2 text-xs font-normal text-muted-foreground";

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
          <TableHead className={HEAD}>Nombre</TableHead>
          <TableHead className={HEAD}>Email</TableHead>
          <TableHead className={HEAD}>Rol</TableHead>
          <TableHead className={`${HEAD} text-right`}>Creado</TableHead>
          <TableHead className={`${HEAD} w-12`}>
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="h-12">
            <TableCell className="max-w-[220px] font-medium">
              {user.name}
            </TableCell>
            <TableCell className="max-w-[240px] text-muted-foreground">
              {user.email}
            </TableCell>
            <TableCell>
              <RoleBadge roleName={user.roleName} />
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell>
              <UserActionsMenu
                user={user}
                isSelf={user.id === currentUserId}
              />
            </TableCell>
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
