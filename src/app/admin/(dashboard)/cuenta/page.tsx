import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/admin/account/change-password-form";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  INSTRUCTOR: "Instructor",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mi cuenta</h1>
      <div className="rounded-lg border p-4 space-y-2 max-w-md">
        <dl className="grid gap-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="font-medium">{session.user.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{session.user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rol</dt>
            <dd className="font-medium">
              {ROLE_LABELS[session.user.role] ?? session.user.role}
            </dd>
          </div>
        </dl>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
