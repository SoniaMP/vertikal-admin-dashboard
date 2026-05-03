import Link from "next/link";
import Image from "next/image";
import { CircleUser } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "./logout-button";
import { NavLink } from "./nav-link";
import { getNavItemsForRole } from "./nav-items";

type Props = {
  userName: string;
  userRole: string;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  INSTRUCTOR: "Instructor",
};

export function AdminSidebar({ userName, userRole }: Props) {
  const navItems = getNavItemsForRole(userRole);
  const navHrefs = navItems.map((item) => item.href);

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="p-4">
        <Link href="/admin">
          <Image
            src="/logo-horizontal-light.png"
            alt="Club Vertikal"
            width={160}
            height={40}
            priority
          />
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <CircleUser className="h-4 w-4 text-sidebar-foreground/70 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{userName}</p>
            <p className="text-[10px] text-sidebar-foreground/50">
              {ROLE_LABELS[userRole] ?? userRole}
            </p>
          </div>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={<item.icon className="h-4 w-4" />}
            navHrefs={navHrefs}
          />
        ))}
      </nav>
      <Separator />
      <div className="p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
