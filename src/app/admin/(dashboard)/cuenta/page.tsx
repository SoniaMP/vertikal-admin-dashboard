import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/admin/account/change-password-form";
import { AccountIdentity } from "@/components/admin/account/account-identity";
import { SettingsSection } from "@/components/admin/settings-section";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  INSTRUCTOR: "Instructor",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const roleLabel =
    ROLE_LABELS[session.user.role] ?? session.user.role ?? "Administrador";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Mi cuenta
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Con qué datos entras al panel, y cómo cambiar tu contraseña.
        </p>
      </div>

      <SettingsSection
        title="Quién eres"
        description="Tu nombre y tu correo se editan desde Usuarios, que es donde vive la lista de quién tiene acceso al panel."
      >
        <AccountIdentity
          name={session.user.name ?? "—"}
          email={session.user.email ?? "—"}
          roleLabel={roleLabel}
        />
      </SettingsSection>

      <SettingsSection
        title="Contraseña"
        description="Pide la actual antes de cambiarla, para que nadie que se encuentre tu sesión abierta pueda dejarte fuera."
      >
        <ChangePasswordForm />
      </SettingsSection>
    </div>
  );
}
