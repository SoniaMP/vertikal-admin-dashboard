import { AdminLoginBand } from "@/components/admin/admin-login-band";
import { LoginForm } from "@/components/admin/login-form";
import { ClubContactLink } from "@/components/contact/club-contact-link";
import { fetchActiveSeasonLabel } from "@/lib/active-season-label";

export const metadata = {
  title: "Acceso al panel - Club Vertikal",
};

export default async function AdminLoginPage() {
  const seasonLabel = await fetchActiveSeasonLabel();

  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr] md:grid-cols-[38%_1fr] md:grid-rows-1">
      <AdminLoginBand seasonLabel={seasonLabel} />

      <main className="flex items-start px-5 py-10 md:items-center md:px-18 md:py-14">
        <div className="w-full max-w-[420px]">
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            Acceso al panel
          </h1>
          <p className="mt-2.5 text-[17px] text-muted-foreground">
            Gestión de socios, licencias y cursos.
          </p>

          <LoginForm />

          <p className="mt-5 text-sm text-muted-foreground">
            ¿Has perdido la contraseña? Escribe a{" "}
            <ClubContactLink subject="Acceso al panel de administración" />.
          </p>
        </div>
      </main>
    </div>
  );
}
