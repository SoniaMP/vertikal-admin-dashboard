import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "./logout-button";
import { NavLink } from "./nav-link";
import { getNavItemsForRole } from "./nav-items";

type Props = {
  userName: string;
  userRole: string;
};

const CLUB_HREFS = ["/admin/cuenta", "/admin/ajustes"];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  INSTRUCTOR: "Instructor",
};

export function AdminSidebar({ userName, userRole }: Props) {
  const navItems = getNavItemsForRole(userRole);
  const navHrefs = navItems.map((item) => item.href);

  // Club comes last and apart: the four items above it are the work, these
  // two are about who is using the panel.
  const clubItems = navItems.filter((item) => CLUB_HREFS.includes(item.href));
  const workItems = navItems.filter((item) => !CLUB_HREFS.includes(item.href));

  return (
    <aside className="flex h-full w-60 flex-col gap-0.5 bg-sidebar px-3 py-4 text-sidebar-foreground">
      <Link href="/admin" className="mb-6 block px-2">
        <Image
          src="/logo-horizontal-light.png"
          alt="Club Vertikal"
          width={2654}
          height={653}
          priority
          className="h-auto w-[160px]"
        />
      </Link>

      {workItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={<item.icon className="size-4" />}
          navHrefs={navHrefs}
        />
      ))}

      {clubItems.length > 0 && (
        <p className="mt-6 mb-1.5 px-2 text-xs text-sidebar-foreground/60">
          Club
        </p>
      )}
      {clubItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={<item.icon className="size-4" />}
          navHrefs={navHrefs}
        />
      ))}

      <div className="mt-auto">
        <div className="px-2 py-2.5">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="text-xs text-sidebar-foreground/60">
            {ROLE_LABELS[userRole] ?? userRole}
          </p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
