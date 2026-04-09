import { auth } from "@/lib/auth";
import { fetchUsers } from "@/lib/user-queries";
import { UsersTable } from "@/components/admin/users/users-table";
import { CreateUserButton } from "@/components/admin/users/create-user-button";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <CreateUserButton />
      </div>
      <UsersTable users={rows} currentUserId={session?.user?.id ?? ""} />
    </div>
  );
}
