import { auth } from "@/lib/auth";
import { fetchUsers } from "@/lib/user-queries";
import { UsersTable } from "@/components/admin/users/users-table";
import { CreateUserButton } from "@/components/admin/users/create-user-button";
import { formatUserRolesFinding } from "@/helpers/user-roles-finding";

export default async function UsuariosPage() {
  const [users, session] = await Promise.all([fetchUsers(), auth()]);

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    roleName: u.roles[0]?.role.name ?? "ADMIN",
    createdAt: u.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatUserRolesFinding(rows.map((row) => row.roleName))}
          </p>
        </div>
        <CreateUserButton />
      </div>
      <UsersTable users={rows} currentUserId={session?.user?.id ?? ""} />
    </div>
  );
}
