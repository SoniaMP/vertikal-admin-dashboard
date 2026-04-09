"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Creado</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {user.email}
            </TableCell>
            <TableCell>
              <RoleBadge roleName={user.roleName} />
            </TableCell>
            <TableCell className="text-muted-foreground">
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

function RoleBadge({ roleName }: { roleName: string }) {
  const label = ROLE_LABELS[roleName] ?? roleName;
  const isAdmin = roleName === "ADMIN";

  return (
    <Badge
      className={
        isAdmin
          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
          : "bg-purple-100 text-purple-800 hover:bg-purple-100"
      }
    >
      {label}
    </Badge>
  );
}
