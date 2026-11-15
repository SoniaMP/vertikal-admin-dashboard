import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MobileSidebar } from "@/components/admin/mobile-sidebar";
import { AttentionBanner } from "@/components/admin/attention-banner";

export const metadata = {
  title: "Panel de administración - Club Vertikal",
  description:
    "Gestión de socios, cursos, licencias federativas y ajustes del club.",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const userName = session.user.name ?? "Admin";
  const userRole = session.user.role ?? "ADMIN";

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="hidden md:block">
        <AdminSidebar userName={userName} userRole={userRole} />
      </div>
      <MobileSidebar userName={userName} userRole={userRole} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <AttentionBanner />
        {children}
      </main>
    </div>
  );
}
